import {Queries} from "../queries/index.js";
import {buildSenderProvider} from "../senders/index.js";
import {getConfigRowByKey} from "../queries/config.js";
import {SenderConfigKey, senderProviderConfigGuard} from "@astoniq/idp-schemas";
import {Handlers} from "../handlers/index.js";

export const createSenderLibrary = (options: {
    queries: Queries,
    handlers: Handlers,
}) => {

    const {
        queries: {
            pool
        }
    } = options

    const createSender = async () => {

        const configRow = await getConfigRowByKey(pool, SenderConfigKey.SenderProvider)

        if (!configRow) {
            throw new Error('Failed to get sender config from database')
        }

        const config = senderProviderConfigGuard.parse(configRow.value)

        return buildSenderProvider(config, options)
    }

    return {
        createSender
    }
}