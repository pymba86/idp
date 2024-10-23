import {ZodError, ZodSchema} from "zod";
import {formatZodError} from "../utils/zod.js";

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
     * Start after n seconds, default 0
     */
    startAfter: number;
    /**
     * How many seconds a task may be in active state before it is failed because of expiration. Default 60 * 5 (5minutes)
     */
    expireIn: number;
    /**
     * A singleton key which can be used to have an unique active task in a queue.
     */
    uniqueKey: string | null;
}

export const defaultTaskConfig: TaskConfig = {
    retryDelay: 5,
    retryLimit: 3,
    startAfter: 0,
    expireIn: 60 * 5, // 5 minutes
    uniqueKey: null
}

export interface DefineTaskProps<T> {
    name: string;
    queue?: string;
    schema: ZodSchema<T>;
    config?: Partial<TaskConfig>;
}

export interface TaskDefinition<T> extends DefineTaskProps<T> {
    validate: (input:T) => T;
    from: (input: T, config?: Partial<TaskConfig>) => Task<T>
}

export interface Handler<Data, Output> {
    (props: { name: string, data: Data }): Promise<Output | void>
}

export interface TaskHandler<T = object, O = object> extends TaskDefinition<T> {
    handler: Handler<T, O>;
    config: Partial<TaskConfig>;
}

export interface Task<Data = {}> {
    name: string;
    queue?: string;
    data: Data;
    config: Partial<TaskConfig>
}

export const defineTask = <T>(props: DefineTaskProps<T>): TaskDefinition<T> => {

    const validate = (data: T): T => {
        try {
           return props.schema.parse(data)
        } catch (error) {
            if (error instanceof ZodError) {
                throw new Error(
                    `invalid input: ${formatZodError(error).join('\n')}`
                );
            } else {
                throw error
            }
        }
    }

    return {
        schema: props.schema,
        name: props.name,
        queue: props.queue,
        validate: validate,
        from: (input, config) => {
            return {
                queue: props.queue,
                name: props.name,
                data: validate(input),
                config: {...props.config, ...config},
            }
        },
        config: props.config ?? {},
    }
}

export const createTaskHandler = <T, O>(definition: TaskDefinition<T>, handler: Handler<T, O>): TaskHandler<T, O> => {
    return {
        config: definition.config ?? {},
        handler: handler,
        from: definition.from,
        validate: definition.validate,
        schema: definition.schema,
        name: definition.name,
        queue: definition.queue,
    }
}