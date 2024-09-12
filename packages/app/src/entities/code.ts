import {Entity} from "../types/index.js";
import {Code, codeGuard, InsertCode, insertCodeGuard} from "@astoniq/idp-schemas";

export const codeEntity: Entity<
    Code,
    InsertCode
> = {
    table: 'codes',
    tableSingular: 'code',
    fields: {
        id: 'id',
        userId: 'user_id',
        clientId: 'client_id',
        scope: 'scope',
        redirectUri: 'redirect_uri',
        expiresAt: 'expires_at'
    },
    guard: codeGuard,
    insertGuard: insertCodeGuard
}