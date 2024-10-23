import {MigrationScript} from "../types/index.js";
import {SenderConfigKey, SenderProvider} from "@astoniq/idp-schemas";
import {deleteConfigRowByKey, updateConfigValueByKey} from "../queries/config.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await updateConfigValueByKey(pool, SenderConfigKey.SenderProvider, {
            provider: SenderProvider.Console
        });
    },
    down: async (pool) => {
        await deleteConfigRowByKey(pool, SenderConfigKey.SenderProvider);
    }
}

export default migration