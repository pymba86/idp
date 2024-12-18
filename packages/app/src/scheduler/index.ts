import {Handler, Task, TaskConfig, TaskHandler} from "./definitions.js";
import {createTaskWorker} from "./task.js";
import {CommonQueryMethods, sql} from "slonik";
import {createTaskFactory, InsertTask} from "./messages.js";

export type WorkerConfig = {
    /**
     * Amount of concurrent tasks that can be executed, default 25
     */
    concurrency: number;
    /**
     * Interval of pooling the database for new work, default 1500
     */
    intervalInMs: number;
    /**
     * Refill threshold percentage, value between 0 - 1, default 0.33.
     * Automatically refills the task workers queue when activeItems / concurrency < refillPct.
     */
    refillPct: number;
}

export type BusOptions = {
    pool: CommonQueryMethods
    workerConfig?: Partial<WorkerConfig>
    taskConfig?: Partial<TaskConfig>
}

export type TaskName = string;

export type Scheduler = {
    register: (...handlers: TaskHandler<any>[]) => void;
    start: () => Promise<void>;
    stop: () => Promise<void>;
    send: (tasks: Task | Task[], connection?: CommonQueryMethods) => Promise<void>
}

export type TaskState = {
    name: string;
    config: Partial<TaskConfig>
}

export function createScheduler(options: BusOptions): Scheduler {

    const {
        pool,
        taskConfig = {},
        workerConfig = {}
    } = options

    const config = {
        concurrency: 25,
        intervalInMs: 1500,
        refillPct: 0.33,
        ...workerConfig
    }

    const taskHandlers = new Map<TaskName, TaskState & { handler: Handler<any, any> }>()

    const state = {
        started: false,
        stopped: false,
    };

    const taskWorker = createTaskWorker({
        maxConcurrency: config.concurrency,
        poolIntervalInMs: config.intervalInMs,
        refillThresholdPct: config.refillPct,
        pool: pool,
        handler: async ({data, name}) => {
            const taskHandler = taskHandlers.get(name);

            if (!taskHandler) {
                throw new Error('task handler ' + name + 'not registered');
            }

            return taskHandler.handler({name, data})
        }
    })

    const toTask = createTaskFactory({
        config: taskConfig
    })

    const createQueryTasks = (tasks: InsertTask[]) => {
        return sql.unsafe`select * from create_tasks(${JSON.stringify(tasks)}::jsonb)`
    }

    function register(...definitions: TaskHandler<any>[]) {
        definitions.forEach((definition) => {
            if (taskHandlers.has(definition.name)) {
                throw new Error(`task ${definition.name} already registered`);
            }

            taskHandlers.set(definition.name, {
                config: definition.config,
                handler: definition.handler,
                name: definition.name,
            });
        });
    }

    async function start() {
        if (state.started) {
            return;
        }

        state.started = true;

        taskWorker.start();
    }

    async function send(tasks: Task | Task[], connection?: CommonQueryMethods) {
        const sendTasks = Array.isArray(tasks) ? tasks : [tasks];

        const query = createQueryTasks(
            sendTasks.map((task) => toTask(task))
        );

        if (connection) {
            await connection.query(query)
        } else {
            await pool.query(query)
        }

        const hasEffectToCurrentWorker = sendTasks.some((t) => taskHandlers.has(t.name));

        if (hasEffectToCurrentWorker) {
            taskWorker.notify()
        }
    }

    async function stop() {
        if (!state.started || state.stopped) {
            return;
        }

        state.stopped = true;

        await taskWorker.stop();
    }

    return {
        register,
        start,
        stop,
        send
    }
}