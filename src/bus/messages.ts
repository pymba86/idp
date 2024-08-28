
export const TASK_STATES = {
    created: 0,
    retry: 1,
    active: 2,
    completed: 3,
    expired: 4,
    cancelled: 5,
    failed: 6,
}

export type TaskState = (typeof TASK_STATES)[keyof typeof TASK_STATES];

