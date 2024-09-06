import {CommonQueryMethods} from "slonik";
import {createClientQueries} from "./client.js";
import {createUserSessionQueries} from "./user-session.js";

export type Queries = ReturnType<typeof createQueries>

export const createQueries = (pool: CommonQueryMethods) => {

    const clients = createClientQueries(pool)
    const userSessions = createUserSessionQueries(pool)

    return {
        pool,
        clients,
        userSessions
    }
}