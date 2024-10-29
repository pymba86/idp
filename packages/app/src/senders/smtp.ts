import {SmtpSenderProviderConfig, UserRegisterEvent} from "@astoniq/idp-schemas";
import {SenderProvider} from "./definitions.js";
import {createTransport} from "nodemailer";
import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";

export const buildSmtpSenderProvider = (config: SmtpSenderProviderConfig, options: {
    queries: Queries,
    handlers: Handlers
}): SenderProvider => {

    const {
        handlers: {
            template,
            baseUrl
        }
    } = options

    const transport = createTransport(config)

    const sendUserRegisterMessage = async (event: UserRegisterEvent) => {

        const html = await template.renderAsync('user-register', {
            link: `${baseUrl}/auth/activate?code=${event.code}`
        })

        await transport.sendMail({
            from: config.fromEmail,
            replyTo: config.replyTo,
            to: event.email,
            html: html,
            subject: 'Welcome'
        })
    }

    return {
        sendUserRegisterMessage
    }
}