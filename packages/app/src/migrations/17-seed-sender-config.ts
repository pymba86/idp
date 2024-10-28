import {MigrationScript} from "../types/index.js";
import {SenderConfigKey} from "@astoniq/idp-schemas";
import {deleteConfigByKey, updateConfigByKey} from "../queries/config.js";
import {defaultSenderProviderConfig} from "../senders/definitions.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await updateConfigByKey(pool, SenderConfigKey.SenderProvider, defaultSenderProviderConfig);
    },
    down: async (pool) => {
        await deleteConfigByKey(pool, SenderConfigKey.SenderProvider);
    }
}

export default migration