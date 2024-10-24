import {MigrationScript} from "../types/index.js";
import {SenderConfigKey} from "@astoniq/idp-schemas";
import {deleteConfigRowByKey, updateConfigValueByKey} from "../queries/config.js";
import {defaultSenderProviderConfig} from "../senders/definitions.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await updateConfigValueByKey(pool, SenderConfigKey.SenderProvider, defaultSenderProviderConfig);
    },
    down: async (pool) => {
        await deleteConfigRowByKey(pool, SenderConfigKey.SenderProvider);
    }
}

export default migration