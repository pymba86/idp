import {Entity} from "../types/index.js";
import {
    InsertUserProvider,
    insertUserProviderGuard,
    UserProvider,
    userProviderGuard,
} from "@astoniq/idp-schemas";

export const userProviderEntity: Entity<
    UserProvider,
    InsertUserProvider
> = {
    table: 'user_providers',
    tableSingular: 'user_provider',
    fields: {
        id: 'id',
        userId: 'user_id',
        providerId: 'provider_id',
        identityId: 'identity_id'
    },
    guard: userProviderGuard,
    insertGuard: insertUserProviderGuard
}