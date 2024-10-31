import {SmtpSenderConfig, UserRegisterEvent} from "@astoniq/idp-schemas";
import {Sender} from "./definitions.js";
import {createTransport} from "nodemailer";
import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";

export const buildSmtpSender = (config: SmtpSenderConfig, options: {
    queries: Queries,
    handlers: Handlers
}): Sender => {

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