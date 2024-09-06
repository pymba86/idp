import {createWorker} from "./worker.js";
import {BusQueries, SelectTask} from "./messages.js";
import {resolveWithinSeconds} from "./utils.js";
import {serializeError} from "serialize-error";

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
        queries: BusQueries;
        maxConcurrency: number;
        poolIntervalInMs: number;
        refillThresholdPct: number;
    }
) => {
    const activeTasks = new Map<string, Promise<any>>();

    const {
        maxConcurrency,
        handler,
        poolIntervalInMs,
        queries,
        refillThresholdPct
    } = options;

    let hasMoreTasks = false;

    async function resolveTask(task: SelectTask) {
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

            const tasks = await queries.getTasks({
                amount: requestedAmount,
            })

            hasMoreTasks = tasks.length === requestedAmount;

            if (tasks.length === 0) {
                return;
            }

            tasks.forEach((task) => {
                const taskPromise = resolveWithinSeconds(handler(task), task.expireInSeconds)
                    .then(() => {
                        return resolveTask(task);
                    })
                    .catch(() => {
                        return resolveTask(task);
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
        },
    }
}