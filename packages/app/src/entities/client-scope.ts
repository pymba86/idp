import {Entity} from "../types/index.js";
import {ClientScope, InsertClientScope, insertClientScopeGuard, clientScopeGuard} from "@astoniq/idp-schemas";

export const clientScopeEntity: Entity<
    ClientScope,
    InsertClientScope
> = {
    table: 'client_scopes',
    tableSingular: 'client_scope',
    fields: {
        id: 'id',
        clientId: 'client_id',
        scopeId: 'scope_id'
    },
    guard: clientScopeGuard,
    insertGuard: insertClientScopeGuard
}