import {MigrationScript} from "../types/index.js";
import {ConfigKey} from "@astoniq/idp-schemas";
import {deleteConfigByKey, updateConfigByKey} from "../queries/config.js";
import {defaultSenderProviderConfig} from "../senders/definitions.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await updateConfigByKey(pool, ConfigKey.SenderProvider, defaultSenderProviderConfig);
    },
    down: async (pool) => {
        await deleteConfigByKey(pool, ConfigKey.SenderProvider);
    }
}

export default migration