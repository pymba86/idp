import {Entity} from "../types/index.js";
import {InsertScope, insertScopeGuard, Scope, scopeGuard} from "@astoniq/idp-schemas";

export const scopeEntity: Entity<
    Scope,
    InsertScope
> = {
    table: 'scopes',
    tableSingular: 'scope',
    fields: {
        id: 'id',
        name: 'name',
        description: 'description'
    },
    guard: scopeGuard,
    insertGuard: insertScopeGuard
}