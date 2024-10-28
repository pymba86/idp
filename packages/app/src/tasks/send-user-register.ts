import {Scheduler} from "../scheduler/index.js";
import {createTaskHandler, defineTask} from "../scheduler/definitions.js";
import {userRegisterEventGuard} from "@astoniq/idp-schemas";
import {Queries} from "../queries/index.js";
import {buildSenderProvider} from "../senders/index.js";
import {Handlers} from "../handlers/index.js";

export const createSendUserRegisterTask = (options: {
    scheduler: Scheduler,
    handlers: Handlers,
    queries: Queries,
}) => {

    const {
        scheduler,
    } = options

    const task = defineTask({
        name: 'send_user_register',
        schema: userRegisterEventGuard,
    })

    scheduler.register(
        createTaskHandler(task, async (props) => {

            const data = task.validate(props.data)

            const sender = await buildSenderProvider(options)

            await sender.sendUserRegisterMessage(data)
        })
    )

    return task
}