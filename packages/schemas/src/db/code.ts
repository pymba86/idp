import {z} from "zod";

export const codeGuard = z.object({
    id: z.string().min(1).max(21),
    userId: z.string(),
    clientId: z.string(),
    userSessionId: z.string(),
    scope: z.string(),
    redirectUri: z.string(),
    expiresAt: z.number()
})

export type Code = z.infer<typeof codeGuard>;

export const insertCodeGuard = codeGuard.partial({})

export type InsertCode = z.infer<typeof insertCodeGuard>;