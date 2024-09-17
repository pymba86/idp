import {CommonQueryMethods} from "slonik";
import {createClientQueries} from "./client.js";
import {createUserSessionQueries} from "./user-session.js";
import {createUserQueries} from "./user.js";
import {createCodeQueries} from "./code.js";
import {createRefreshTokenQueries} from "./refresh-token.js";

export type Queries = ReturnType<typeof createQueries>

export const createQueries = (pool: CommonQueryMethods) => {

    const clients = createClientQueries(pool)
    const userSessions = createUserSessionQueries(pool)
    const users = createUserQueries(pool)
    const codes = createCodeQueries(pool)
    const refreshTokens = createRefreshTokenQueries(pool)

    return {
        pool,
        clients,
        codes,
        users,
        userSessions,
        refreshTokens
    }
}