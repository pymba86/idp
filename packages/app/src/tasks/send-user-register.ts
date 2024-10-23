import {Scheduler} from "../scheduler/index.js";
import {createTaskHandler, defineTask} from "../scheduler/definitions.js";
import {z} from "zod";

export const createSendUserRegisterTask = (options: {
    scheduler: Scheduler
}) => {

    const {
        scheduler
    } = options

    const task = defineTask({
        name: 'send_user_register',
        schema: z.object({
            email: z.string(),
            code: z.string()
        }),
    })

    scheduler.register(
        createTaskHandler(task, async (props) => {

            const {data} = props

            return task.validate(data)
        })
    )

    return task
}