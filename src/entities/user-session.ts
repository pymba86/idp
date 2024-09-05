import {Entity} from "../types/index.js";
import {InsertUserSession, insertUserSessionGuard, UserSession, userSessionGuard} from "../schemas/index.js";

export const userSessionEntity: Entity<
    UserSession,
    InsertUserSession
> = {
    table: 'user_sessions',
    tableSingular: 'user_session',
    fields: {
        id: 'id',
        sessionId: 'session_id',
        userId: 'user_id'
    },
    guard: userSessionGuard,
    insertGuard: insertUserSessionGuard
}