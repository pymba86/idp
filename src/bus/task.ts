import {createWorker} from "./worker.js";
import {BusQueries, SelectTask} from "./messages.js";
import {resolveWithinSeconds} from "./utils.js";

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
                    .then((result) => {
                        resolveTask(task, null, result);
                    })
                    .catch((err) => {
                        resolveTask(task, err);
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