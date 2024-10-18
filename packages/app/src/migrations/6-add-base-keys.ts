import {MigrationScript} from "../types/index.js";
import {BaseConfigKey, BaseConfigType} from "@astoniq/idp-schemas";
import {getEnvAsStringArray} from "../utils/env.js";
import {buildKeyFromRawString, generatePrivateKey} from "../utils/keys.js";
import {readFile} from 'node:fs/promises';
import {logger} from "../utils/logger.js";
import {deleteConfigRowByKey, updateConfigValueByKey} from "../queries/config.js";

const isBase64FormatPrivateKey = (key: string) => !key.includes('-');

const keysConfigReaders: {
    [key in BaseConfigKey]: () => Promise<{
        value: BaseConfigType[key];
        fromEnv: boolean;
    }>
} = {
    [BaseConfigKey.PrivateKeys]: async () => {
        const privateKeys = getEnvAsStringArray('PRIVATE_KEYS');

        if (privateKeys.length > 0) {
            return {
                value: privateKeys.map((key) =>
                    buildKeyFromRawString(
                        isBase64FormatPrivateKey(key) ? Buffer.from(key, 'base64').toString('utf8') : key
                    )
                ),
                fromEnv: true,
            };
        }

        const privateKeyPaths = getEnvAsStringArray('PRIVATE_KEY_PATHS');

        if (privateKeyPaths.length > 0) {
            const privateKeys = await Promise.all(
                privateKeyPaths.map(async (path) => readFile(path, 'utf8'))
            );
            return {
                value: privateKeys.map((key) => buildKeyFromRawString(key)),
                fromEnv: true,
            };
        }

        return {
            value: [await generatePrivateKey()],
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
                logger.info('Read keys from env')
            } else {
                logger.info('Generated keys')
            }

            await updateConfigValueByKey(pool, key, value)
        }
    },
    down: async (pool) => {
        for (const key of Object.values(BaseConfigKey)) {
            await deleteConfigRowByKey(pool, key)
        }
    }
}

export default migration