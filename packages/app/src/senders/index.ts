import {ConfigKey, SenderType} from "@astoniq/idp-schemas";
import {buildConsoleSender} from "./console.js";
import {defaultSenderConfig, Sender} from "./definitions.js";
import {buildSmtpSender} from "./smtp.js";
import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {getConfigByKey} from "../queries/config.js";

export const buildSender = async (
    options: {
        queries: Queries,
        handlers: Handlers
    }): Promise<Sender> => {

    const {
        queries: {
            pool
        }
    } = options

    const config = await getConfigByKey(pool, ConfigKey.Sender)

    switch (config.provider) {
        case SenderType.Console:
            return buildConsoleSender(config)
        case SenderType.Smtp:
            return buildSmtpSender(config, options)
        default:
            return buildConsoleSender(defaultSenderConfig)
    }
}