import {Scheduler} from "../scheduler/index.js";
import {createTaskHandler, defineTask} from "../scheduler/definitions.js";
import {userRegisterEventGuard} from "@astoniq/idp-schemas";
import {Libraries} from "../libraries/index.js";

export const createSendUserRegisterTask = (options: {
    scheduler: Scheduler,
    libraries: Libraries
}) => {

    const {
        scheduler,
        libraries: {
            sender: {
                createSender
            }
        },
    } = options

    const task = defineTask({
        name: 'send_user_register',
        schema: userRegisterEventGuard,
    })

    scheduler.register(
        createTaskHandler(task, async (props) => {

            const data = task.validate(props.data)

            const sender = await createSender()

            await sender.sendUserRegisterMessage(data)
        })
    )

    return task
}