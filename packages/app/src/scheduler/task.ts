import {createWorker} from "./worker.js";
import {ResolveTask, SelectTask, selectTaskGuard} from "./messages.js";
import {resolveWithinExpireIn} from "./utils.js";
import {serializeError} from "serialize-error";
import {createBatcher} from "./batcher.js";
import {CommonQueryMethods, sql} from "slonik";

export function mapCompletionDataArg(data: any) {
    if (data === null || typeof data === 'undefined' || typeof data === 'function') {
        return null;
    }

    const result = typeof data === 'object' && !Array.isArray(data)
        ? data : {value: data};

    return serializeError(result);
}

export const createTaskWorker = (
    options: {
        handler: (event: SelectTask) => Promise<any>;
        maxConcurrency: number;
        poolIntervalInMs: number;
        refillThresholdPct: number;
        pool: CommonQueryMethods
    }
) => {
    const activeTasks = new Map<string, Promise<any>>();

    const {
        maxConcurrency,
        handler,
        poolIntervalInMs,
        pool,
        refillThresholdPct
    } = options;

    let hasMoreTasks = false;

    const resolveQueryTasks = (tasks: ResolveTask[]) => {
        return sql.unsafe`select * from resolve_tasks(${JSON.stringify(tasks)}::jsonb)`
    }

    const getQueryTasks = (amount: number) => {
        return sql.type(selectTaskGuard)`select * from get_tasks(${amount})`
    }

    const resolveTaskBatcher = createBatcher<ResolveTask>({
        async onFlush(batch) {
            await pool.query(resolveQueryTasks(batch))
        },
        maxSize: 100,
        maxTimeInMs: 50
    })

    async function resolveTask(task: SelectTask, error: any, result?: any) {

        resolveTaskBatcher.add({
            payload: mapCompletionDataArg(error ?? result),
            success: !error,
            id: task.id
        })

        activeTasks.delete(task.id);

        if (hasMoreTasks && activeTasks.size / maxConcurrency <= refillThresholdPct) {
            taskWorker.notify();
        }
    }

    const taskWorker = createWorker(
        async () => {
            if (activeTasks.size >= maxConcurrency) {
                return;
            }

            const requestedAmount = maxConcurrency - activeTasks.size;

            const tasks = await pool.any(getQueryTasks(requestedAmount))

            hasMoreTasks = tasks.length === requestedAmount;

            if (tasks.length === 0) {
                return;
            }

            tasks.forEach((task) => {
                const taskPromise = resolveWithinExpireIn(handler(task), task.expireIn)
                    .then((result) => {
                        return resolveTask(task, null, result);
                    })
                    .catch((error) => {
                        return resolveTask(task, error);
                    });

                activeTasks.set(task.id, taskPromise);
            });

        },
        {loopInterval: poolIntervalInMs}
    )

    return {
        ...taskWorker,
        async stop() {
            await taskWorker.stop();
            await Promise.all(Array.from(activeTasks.values()));
            await resolveTaskBatcher.waitForAll();
        },
    }
}