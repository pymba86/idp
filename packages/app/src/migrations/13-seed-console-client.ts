import {MigrationScript} from "../types/index.js";
import {getEnv} from "../utils/env.js";
import {sql} from "slonik";
import {logger} from "../utils/logger.js";
import {consoleClientName, generateStandardId, PredefinedScope} from "@astoniq/idp-shared";

const endpoint = getEnv('CONSOLE_CLIENT_ENDPOINT')

const migration: MigrationScript = {
    up: async (pool) => {

        if (endpoint) {

            const clientId = generateStandardId()

            const clientSecret = generateStandardId()

            const metadata = {
                redirectUris: [
                    endpoint
                ]
            }
            await pool.query(sql.unsafe`
                insert into clients (id, name, secret, description, metadata, consent)
                values (${clientId}, ${consoleClientName}, ${clientSecret}, ${consoleClientName}, ${sql.jsonb(metadata)},
                        ${false})
            `)

            const scopeId = generateStandardId()

            await pool.query(sql.unsafe`
                insert into scopes (id, name, description)
                values (${scopeId}, ${PredefinedScope.Console}, ${PredefinedScope.Console})`)

            const clientScopeId = generateStandardId()

            await pool.query(sql.unsafe`
                insert into client_scopes (id, client_id, scope_id)
                values (${clientScopeId}, ${clientId}, ${scopeId})`)

            logger.info(`Seed (console client) id: ${clientId} secret: ${clientSecret}`)

        } else {
            logger.info(`Skip seed admin client`)
        }
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            delete
            from clients
            where name = ${consoleClientName}
        `)
    }
}

export default migration