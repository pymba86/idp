import {MigrationScript} from "../types/index.js";
import {getEnv} from "../utils/env.js";
import {sql} from "slonik";
import {generateStandardId} from "@astoniq/idp-shared";
import {hashValue} from "../utils/hash.js";
import {logger} from "../utils/logger.js";

const email = getEnv('ADMIN_USER_EMAIL', 'admin@example.com')
const password = getEnv('ADMIN_USER_PASSWORD', 'admin')

const migration: MigrationScript = {
    up: async (pool) => {

        const passwordHash = await hashValue(password)

        const id = generateStandardId()

        logger.info(`Seed (admin user) email: ${email} password: ${password}`)

        await pool.query(sql.unsafe`
            insert into users (id, email, password)
            values (${id}, ${email}, ${passwordHash})
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            delete
            from users
            where email = ${email}
        `)
    }
}

export default migration