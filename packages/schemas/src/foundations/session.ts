import { z} from "zod";

export const authContextGuard = z.object({
    id: z.string(),
    clientId: z.string(),
    redirectUri: z.string(),
    responseType: z.string(),
    responseMode: z.string(),
    scope: z.string(),
    userId: z.string(),
    authCompleted: z.boolean(),
}).partial()

export type AuthContext = z.infer<typeof authContextGuard>;

export const sessionStoreDataGuard = z.object({
    userSessionId: z.string(),
    authContext: authContextGuard
}).partial()

export type SessionStoreData = z.infer<typeof sessionStoreDataGuard>;
