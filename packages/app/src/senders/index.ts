import {SenderProviderConfig, SenderProviderType} from "@astoniq/idp-schemas";
import {buildConsoleSenderProvider} from "./console.js";
import {defaultSenderProviderConfig, SenderProvider} from "./definitions.js";
import {buildSmtpSenderProvider} from "./smtp.js";
import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";

export const buildSenderProvider = (
    config: SenderProviderConfig,
    options: {
        queries: Queries,
        handlers: Handlers
    }): SenderProvider => {
    switch (config.provider) {
        case SenderProviderType.Console:
            return buildConsoleSenderProvider(config)
        case SenderProviderType.Smtp:
            return buildSmtpSenderProvider(config, options)
        default:
            return buildConsoleSenderProvider(defaultSenderProviderConfig)
    }
}