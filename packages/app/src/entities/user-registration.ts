import {Entity} from "../types/index.js";
import {
    InsertUserRegistration,
    insertUserRegistrationGuard,
    UserRegistration,
    userRegistrationGuard
} from "@astoniq/idp-schemas";

export const userRegistrationEntity: Entity<
    UserRegistration,
    InsertUserRegistration
> = {
    table: 'user_registrations',
    tableSingular: 'user_registration',
    fields: {
        id: 'id',
        email: 'email',
        password: 'password',
        expiresAt: 'expires_at'
    },
    guard: userRegistrationGuard,
    insertGuard: insertUserRegistrationGuard
}