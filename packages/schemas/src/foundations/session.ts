import {z} from "zod";
import {ProviderAction, userInfoGuard} from "./provider.js";

export const authContextGuard = z.object({
    id: z.string(),
    email: z.string(),
    clientId: z.string(),
    redirectUri: z.string(),
    responseType: z.string(),
    responseMode: z.string(),
    scope: z.string(),
    userId: z.string(),
    authCompleted: z.boolean(),
    verifyCompleted: z.boolean(),
    userInfo: userInfoGuard
}).partial()

export type AuthContext = z.infer<typeof authContextGuard>;

export const providerContextGuard = z.object({
    action: z.nativeEnum(ProviderAction),
    nonce: z.string(),
    redirectUri: z.string(),
    providerId: z.string(),
    state: z.string(),
    codeVerifier: z.string(),
    codeChallenge: z.string()
}).partial()

export type ProviderContext = z.infer<typeof providerContextGuard>;

export const sessionStoreDataGuard = z.object({
    userSessionId: z.string(),
    authContext: authContextGuard,
    providerContext: providerContextGuard
}).partial()

export type SessionStoreData = z.infer<typeof sessionStoreDataGuard>;
