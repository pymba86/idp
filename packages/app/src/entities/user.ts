import {Entity} from "../types/index.js";
import {
    InsertUser, insertUserGuard,
    User, userGuard,
} from "@astoniq/idp-schemas";

export const userEntity: Entity<
    User,
    InsertUser
> = {
    table: 'users',
    tableSingular: 'user',
    fields: {
        id: 'id',
        email: 'email',
        password: 'password'
    },
    guard: userGuard,
    insertGuard: insertUserGuard
}