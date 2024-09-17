import {Entity} from "../types/index.js";
import {InsertRefreshToken, insertRefreshTokenGuard, RefreshToken, refreshTokenGuard} from "@astoniq/idp-schemas";

export const refreshTokenEntity: Entity<
    RefreshToken,
    InsertRefreshToken
> = {
    table: 'refresh_tokens',
    tableSingular: 'refresh_token',
    fields: {
        id: 'id',
        userSessionId: 'user_session_id',
        scope: 'scope',
        type: 'type',
        expiresAt: 'expires_at'
    },
    guard: refreshTokenGuard,
    insertGuard: insertRefreshTokenGuard
}