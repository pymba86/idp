import {MigrationScript} from "../types/index.js";
import {deleteConfigByKey, updateConfigByKey} from "../queries/config.js";
import {generateJWK} from "../utils/jwks.js";
import {generateStandardId} from "@astoniq/idp-shared";
import {ConfigKey} from "@astoniq/idp-schemas";

const migration: MigrationScript = {
    up: async (pool) => {

        const id = generateStandardId()

        const key = await generateJWK(id)

        // JWKS
        await updateConfigByKey(pool, ConfigKey.Jwks, [
            {
                id,
                key,
                startAt: Date.now()
            }
        ])

        // SignInExperience
        await updateConfigByKey(pool, ConfigKey.SignInExperience, {
            passwordPolicy: {
                length: {
                    min: 8,
                    max: 256
                },
                charTypes: []
            }
        })
    },
    down: async (pool) => {
        await deleteConfigByKey(pool, ConfigKey.Jwks)
        await deleteConfigByKey(pool, ConfigKey.SignInExperience)
    }
}

export default migration