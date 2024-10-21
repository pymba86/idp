import {Scheduler} from "../scheduler/index.js";
import {createTaskHandler, defineTask} from "../scheduler/definitions.js";
import {z} from "zod";

export const createSendUserRegisterTask = (options: {
    scheduler: Scheduler
}) => {

    const {
        scheduler
    } = options

    const sendUserRegisterTask = defineTask({
        name: 'send_user_register',
        schema: z.object({
            email: z.string(),
            code: z.string()
        }),
    })

    scheduler.register(
        createTaskHandler(sendUserRegisterTask, async (props) => {
            return props
        })
    )

    return sendUserRegisterTask
}