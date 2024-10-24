import {Scheduler} from "../scheduler/index.js";
import {createSendUserRegisterTask} from "./send-user-register.js";
import {Libraries} from "../libraries/index.js";

export type Tasks = ReturnType<typeof createTasks>

export const createTasks = (options: {
    scheduler: Scheduler,
    libraries: Libraries
}) => {

    const sendUserRegisterTask = createSendUserRegisterTask(options)

    return {
        sendUserRegisterTask
    }
}