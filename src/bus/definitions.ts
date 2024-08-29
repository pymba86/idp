import {ZodSchema} from "zod";

export type TaskConfig = {
    /**
     *  Amount of times the task is retried, default 3
     */
    retryLimit: number;
    /**
     * Delay between retries of failed tasks, in seconds. Default 5
     */
    retryDelay: number;
    /**
     * Expentional retrybackoff, default false
     */
    retryBackoff: boolean;
    /**
     * Start after n seconds, default 0
     */
    startAfterSeconds: number;
    /**
     * How many seconds a task may be in active state before it is failed because of expiration. Default 60 * 5 (5minutes)
     */
    expireInSeconds: number;
    /**
     * How long task is hold in the tasks table before it is archieved. Default 7 * 24 * 60 * 60 (7 days)
     */
    keepInSeconds: number;
    /**
     * A singleton key which can be used to have an unique active task in a queue.
     */
    uniqueKey: string | null;
}

export const defaultTaskConfig: TaskConfig = {
    retryBackoff: false,
    retryDelay: 5,
    retryLimit: 3,
    startAfterSeconds: 0,
    expireInSeconds: 60 * 5, // 5 minutes
    keepInSeconds: 7 * 24 * 60 * 60,
    uniqueKey: null,
}

export interface DefineTaskProps<T> {
    name: string;
    queue?: string;
    schema: ZodSchema<T>;
    config?: Partial<TaskConfig>;
}

export interface TaskDefinition<T> extends DefineTaskProps<T>{
    from: (input:T, config?: Partial<TaskConfig>) => Task<T>
}

export interface Handler<Data> {
    (props: {name: string, data: Data}): Promise<any>
}

export interface TaskHandler<T>  extends TaskDefinition<T> {
    handler: Handler<T>;
    config: Partial<TaskConfig>;
}

export interface Task<Data = {}> {
    name: string;
    queue?: string;
    data: Data;
    config: Partial<TaskConfig>
}

export const defineTask = <T>(props: DefineTaskProps<T>): TaskDefinition<T> => {
    return {
        schema: props.schema,
        name: props.name,
        queue: props.queue,
        from: (input, config) => {
            return {
                queue: props.queue,
                name: props.name,
                data: input,
                config: { ...props.config, ...config },
            }
        },
        config: props.config ?? {},
    }
}

export const createTaskHandler = <T>(definition: TaskDefinition<T>, handler: Handler<T>): TaskHandler<T> => {
    return {
        config: definition.config ?? {},
        handler: handler,
        from: definition.from,
        schema: definition.schema,
        name: definition.name,
        queue: definition.queue,
    }
}

