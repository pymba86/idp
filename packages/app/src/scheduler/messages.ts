import {z} from "zod";
import {jsonObjectGuard} from "@astoniq/idp-schemas";
import {defaultTaskConfig, Task, TaskConfig} from "./definitions.js";
import {generateStandardId} from "@astoniq/idp-shared";

export const TASK_STATES = {
    created: 0,
    retry: 1,
    active: 2,
    completed: 3,
    expired: 4,
    cancelled: 5,
    failed: 6,
}

export const selectTaskGuard = z.object({
    id: z.string(),
    retryCount: z.number(),
    state: z.number(),
    name: z.string(),
    data: jsonObjectGuard,
    expireIn: z.number()
})

export type SelectTask = z.infer<typeof selectTaskGuard>

export type TaskResult = {
    id: string;
}

export type TaskState = (typeof TASK_STATES)[keyof typeof TASK_STATES];

export type InsertTask<T = object> = {
    id: string;
    name: string;
    expireIn?: number;
    data: T;
    state?: TaskState;
    retryLimit?: number;
    retryDelay?: number;
    startAfter?: number;
    uniqueKey?: string | null;
}

export type ResolveTask = {
    id: string;
    success: boolean;
    payload: string;
}

export const createTaskFactory =
    (props: { config: Partial<TaskConfig>; }) =>
        (task: Task): InsertTask => {

            const config: TaskConfig = {
                ...defaultTaskConfig,
                ...props.config,
                ...task.config,
            };

            const id = generateStandardId()

            return {
                id: id,
                data: task.data,
                uniqueKey: config.uniqueKey,
                name: task.name,
                expireIn: config.expireIn,
                retryDelay: config.retryDelay,
                retryLimit: config.retryLimit,
                startAfter: config.startAfter,
            };
        };