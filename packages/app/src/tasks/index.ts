import {Scheduler} from "../scheduler/index.js";
import {createSendUserRegisterTask} from "./send-user-register.js";
import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";

export type Tasks = ReturnType<typeof createTasks>

export const createTasks = (options: {
    scheduler: Scheduler,
    queries: Queries,
    handlers: Handlers
}) => {

    const sendUserRegisterTask = createSendUserRegisterTask(options)

    return {
        sendUserRegisterTask
    }
}