import {MigrationScript} from "../types/index.js";
import {BaseConfigKey, BaseConfigType} from "@astoniq/idp-schemas";
import {logger} from "../utils/logger.js";
import {deleteConfigByKey, updateConfigByKey} from "../queries/config.js";
import {generateJWK} from "../utils/jwks.js";
import {generateStandardId} from "@astoniq/idp-shared";

const keysConfigReaders: {
    [key in BaseConfigKey]: () => Promise<{
        value: BaseConfigType[key];
        fromEnv: boolean;
    }>
} = {
    [BaseConfigKey.Jwks]: async () => {
        const id = generateStandardId()
        const key = await generateJWK(id)
        return {
            value: [
                {
                    id,
                    key,
                    startAt: Date.now()
                }
            ],
            fromEnv: false,
        };
    }
}

const migration: MigrationScript = {
    up: async (pool) => {
        for (const key of Object.values(BaseConfigKey)) {
            const {value, fromEnv} = await keysConfigReaders[key]();

            logger.info(`Seed ${key} base config`)

            if (fromEnv) {
                logger.info(`Read ${key} config from env`)
            } else {
                logger.info(`Generated ${key} default config`)
            }

            await updateConfigByKey(pool, key, value)
        }
    },
    down: async (pool) => {
        for (const key of Object.values(BaseConfigKey)) {
            await deleteConfigByKey(pool, key)
        }
    }
}

export default migration