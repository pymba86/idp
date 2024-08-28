import {createMockPool, createMockQueryResult, createPool, parseDsn} from "slonik";
import {createInterceptorsPreset} from "./interceptor-preset.js";
import {assert} from "../utils/assert.js";

export const createDbPool = async (
    databaseDsn: string,
    mockDatabaseConnection: boolean,
    poolSize?: number
) => {
    if (mockDatabaseConnection) {
        return createMockPool({query: async () => createMockQueryResult([])})
    }

    assert(parseDsn(databaseDsn).databaseName, new Error("Database name is required in url"))

    return createPool(databaseDsn, {
        interceptors: createInterceptorsPreset(),
        maximumPoolSize: poolSize
    })

}