import {CommonQueryMethods} from "slonik";
import {createClientQueries} from "./client.js";

export type Queries = ReturnType<typeof createQueries>

export const createQueries = (pool: CommonQueryMethods) => {

    const clients = createClientQueries(pool)

    return {
        pool,
        clients
    }
}