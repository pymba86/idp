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
            renderTemplate,
            baseUrl
        }
    } = options

    const transport = createTransport(config)

    const sendUserRegisterMessage = async (event: UserRegisterEvent) => {
        await transport.sendMail({
            from: config.fromEmail,
            replyTo: config.replyTo,
            to: event.email,
            html: renderTemplate('user-register', {
                link: `${baseUrl}/auth/activate?code=${event.code}`
            }),
            subject: 'Welcome'
        })
    }

    return {
        sendUserRegisterMessage
    }
}