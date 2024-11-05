import {CommonQueryMethods} from "slonik";
import {createClientQueries} from "./client.js";
import {createUserSessionQueries} from "./user-session.js";
import {createUserQueries} from "./user.js";
import {createCodeQueries} from "./code.js";
import {createRefreshTokenQueries} from "./refresh-token.js";
import {createScopeQueries} from "./scope.js";
import {createUserConsentQueries} from "./user-consent.js";
import {createClientScopeQueries} from "./client-scope.js";
import {createUserRegistrationQueries} from "./user-registration.js";
import {createProviderQueries} from "./provider.js";

export type Queries = ReturnType<typeof createQueries>

export const createQueries = (pool: CommonQueryMethods) => {

    const clients = createClientQueries(pool)
    const userSessions = createUserSessionQueries(pool)
    const users = createUserQueries(pool)
    const codes = createCodeQueries(pool)
    const refreshTokens = createRefreshTokenQueries(pool)
    const scopes = createScopeQueries(pool)
    const userConsents = createUserConsentQueries(pool)
    const clientScopes = createClientScopeQueries(pool)
    const userRegistrations = createUserRegistrationQueries(pool)
    const providers = createProviderQueries(pool)

    return {
        pool,
        userRegistrations,
        clientScopes,
        clients,
        codes,
        users,
        userSessions,
        refreshTokens,
        scopes,
        userConsents,
        providers
    }
}