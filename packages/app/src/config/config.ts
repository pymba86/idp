import {assertEnv, getEnv} from "../utils/env.js";
import {tryThat} from "../utils/function.js";

export type Config = ReturnType<typeof loadConfig>

export const loadConfig = () => {

    const databaseUrl = tryThat(() => assertEnv('DB_URL'), () => {
        return new Error(`No Postgres DSN found in env key 'DB_URL' variables'`);
    });

    const baseUrl = tryThat(() => assertEnv('BASE_URL'), () => {
        return new Error(`No base url found in env key 'BASE_URL' variables'`);
    })

    const databasePoolSize = Number(
        getEnv('DATABASE_POOL_SIZE', '20'));

    const isUnitTest = getEnv(
        'NODE_ENV') === 'test';

    const serverHost = getEnv(
        'SERVER_HOST', '0.0.0.0')

    const serverPort = Number(
        getEnv('SERVER_PORT', '3000'))

    return {
        baseUrl,
        databaseUrl,
        isUnitTest,
        serverHost,
        serverPort,
        databasePoolSize
    }
}