import {Entity} from "../types/index.js";
import { InsertSession, Session} from "@astoniq/idp-schemas";
import {sessionGuard} from "@astoniq/idp-schemas";
import {insertSessionGuard} from "@astoniq/idp-schemas";

export const sessionEntity: Entity<
    Session,
    InsertSession
> = {
    table: 'sessions',
    tableSingular: 'session',
    fields: {
        id: 'id',
        remember: 'remember',
        expiresAt: 'expires_at',
        sameSite: 'same_site',
        secure: 'secure',
        domain: 'domain',
        path: 'path',
        data: 'data',
        httpOnly: 'http_only'
    },
    guard: sessionGuard,
    insertGuard: insertSessionGuard
}