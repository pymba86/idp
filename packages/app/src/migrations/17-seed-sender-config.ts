import {MigrationScript} from "../types/index.js";
import {ConfigKey} from "@astoniq/idp-schemas";
import {deleteConfigByKey, updateConfigByKey} from "../queries/config.js";
import {defaultSenderConfig} from "../senders/definitions.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await updateConfigByKey(pool, ConfigKey.Sender, defaultSenderConfig);
    },
    down: async (pool) => {
        await deleteConfigByKey(pool, ConfigKey.Sender);
    }
}

export default migration