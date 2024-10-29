import {ConfigKey, SenderProviderType} from "@astoniq/idp-schemas";
import {buildConsoleSenderProvider} from "./console.js";
import {defaultSenderProviderConfig, SenderProvider} from "./definitions.js";
import {buildSmtpSenderProvider} from "./smtp.js";
import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {getConfigByKey} from "../queries/config.js";

export const buildSenderProvider = async (
    options: {
        queries: Queries,
        handlers: Handlers
    }): Promise<SenderProvider> => {

    const {
        queries: {
            pool
        }
    } = options

    const config = await getConfigByKey(pool, ConfigKey.SenderProvider)

    switch (config.provider) {
        case SenderProviderType.Console:
            return buildConsoleSenderProvider(config)
        case SenderProviderType.Smtp:
            return buildSmtpSenderProvider(config, options)
        default:
            return buildConsoleSenderProvider(defaultSenderProviderConfig)
    }
}