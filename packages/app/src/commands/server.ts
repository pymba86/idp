import type {CommandModule} from 'yargs';
import {loadConfig, loadKeysFromBaseConfig} from "../config/index.js";
import {createDbPool} from "../database/create-pool.js";
import {createQueries} from "../queries/index.js";
import {startServer} from "../server/index.js";
import {getBaseConfigs} from "../libraries/config.js";

export const server: CommandModule = {
    command: ['*', 'server'],
    describe: 'Start server',
    handler: async () => {

        const config = loadConfig()

        const pool = await createDbPool(
            config.databaseUrl,
            config.isUnitTest,
            config.databasePoolSize
        )

        const baseConfigs = await getBaseConfigs(pool)

        const keys = await loadKeysFromBaseConfig(baseConfigs);

        const queries = createQueries(pool)

        return startServer({config, queries, keys, pool})
    }
}