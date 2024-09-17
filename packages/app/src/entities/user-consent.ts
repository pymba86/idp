import {Entity} from "../types/index.js";
import {InsertUserConsent, insertUserConsentGuard, UserConsent, userConsentGuard} from "@astoniq/idp-schemas";

export const userConsentEntity: Entity<
    UserConsent,
    InsertUserConsent
> = {
    table: 'user_consents',
    tableSingular: 'user_consent',
    fields: {
        id: 'id',
        userId: 'user_id',
        clientId: 'client_id'
    },
    guard: userConsentGuard,
    insertGuard: insertUserConsentGuard
}