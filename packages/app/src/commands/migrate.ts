import {createInterceptorsPreset} from "../database/interceptor-preset.js";
import {createPool, parseDsn} from "slonik";
import {assert} from "../utils/assert.js";
import {assertEnv} from "../utils/env.js";
import {tryThat} from "../utils/function.js";
import {CommandModule} from "yargs";
import {deployMigration, getAvailableMigrations} from "../libraries/migration.js";
import {logger} from "../utils/logger.js";

const createPoolFromEnv = async () => {

    const databaseUrl = tryThat(() => assertEnv('DB_URL'), () => {
        return new Error(`No Postgres DSN found in env key 'DB_URL' variables'`);
    });

    assert(parseDsn(databaseUrl).databaseName, new Error("Database name is required in url"))

    return createPool(databaseUrl, {
        interceptors: createInterceptorsPreset(),
    })
}

export const migrate: CommandModule<unknown, { action: string }> = {
    command: ['migrate [action]'],
    describe: 'Perform database migrate',
    builder: (yargs) =>
        yargs
            .positional('action', {
                describe: 'The action to perform, accepts `deploy`, `rollback`, `up`, `down',
                type: 'string',
                default: 'deploy',
                demandOption: true
            }),
    handler: async ({action}) => {
        switch (action) {
            case 'deploy': {
                const pool = await createPoolFromEnv()

                const migrations = await getAvailableMigrations(pool, 'gt', false)

                for (const migration of migrations) {
                    await deployMigration(pool, migration)
                }

                await pool.end();
                break;
            }
            case 'up': {
                const pool = await createPoolFromEnv()

                const migrations = await getAvailableMigrations(pool, 'gt', false, 1)

                for (const migration of migrations) {
                    await deployMigration(pool, migration)
                }

                await pool.end();
                break;
            }
            case 'rollback': {
                const pool = await createPoolFromEnv()

                const migrations = await getAvailableMigrations(pool, 'lte', true)

                for (const migration of migrations) {
                    await deployMigration(pool, migration, 'down');
                }

                await pool.end();
                break;
            }
            case 'down': {
                const pool = await createPoolFromEnv()

                const migrations = await getAvailableMigrations(pool, 'lte', true, 1)

                for (const migration of migrations) {
                    await deployMigration(pool, migration, 'down');
                }

                await pool.end();
                break;
            }
            default:
                logger.fatal('Unsupported action')
        }
    }
}