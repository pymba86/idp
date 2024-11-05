import {Entity} from "../types/index.js";
import {
    InsertProvider,
    insertProviderGuard,
    Provider,
    providerGuard,
} from "@astoniq/idp-schemas";

export const providerEntity: Entity<
    Provider,
    InsertProvider
> = {
    table: 'providers',
    tableSingular: 'provider',
    fields: {
        id: 'id',
        type: 'type',
        config: 'config',
        name: 'name',
        sso: 'sso',
        link: 'link',
        domains: 'domains'
    },
    guard: providerGuard,
    insertGuard: insertProviderGuard
}