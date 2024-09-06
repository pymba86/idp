import {CommonQueryMethods} from "slonik";
import {createClientQueries} from "./client.js";
import {createUserSessionQueries} from "./user-session.js";
import {createUserQueries} from "./user.js";

export type Queries = ReturnType<typeof createQueries>

export const createQueries = (pool: CommonQueryMethods) => {

    const clients = createClientQueries(pool)
    const userSessions = createUserSessionQueries(pool)
    const users = createUserQueries(pool)

    return {
        pool,
        clients,
        users,
        userSessions
    }
}