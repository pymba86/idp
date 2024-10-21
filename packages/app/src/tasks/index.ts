import {Scheduler} from "../scheduler/index.js";
import {createSendUserRegisterTask} from "./send-user-register.js";

export type Tasks = ReturnType<typeof createTasks>

export const createTasks = (options: {
    scheduler: Scheduler
}) => {

    const sendUserRegisterTask = createSendUserRegisterTask(options)

    return {
        sendUserRegisterTask
    }
}