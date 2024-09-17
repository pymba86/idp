import {MigrationScript} from "../types/index.js";
import {getEnv} from "../utils/env.js";
import {sql} from "slonik";
import {logger} from "../utils/logger.js";
import {adminClientName, generateStandardId} from "@astoniq/idp-shared";

const endpoint = getEnv('ADMIN_CLIENT_ENDPOINT')

const migration: MigrationScript = {
    up: async (pool) => {

        if (endpoint) {

            const id = generateStandardId()

            const secret = generateStandardId()

            const metadata = {
                redirectUris: [
                    endpoint
                ]
            }
            await pool.query(sql.unsafe`
                insert into clients (id, name, secret, description, metadata, consent_required)
                values (${id}, ${adminClientName}, ${secret}, ${adminClientName}, ${sql.jsonb(metadata)}, ${false})
            `)

            logger.info(`Seed (admin client) id: ${id} secret: ${secret}`)

        } else {
            logger.info(`Skip seed admin client`)
        }
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            delete
            from clients
            where name = ${adminClientName}
        `)
    }
}

export default migration