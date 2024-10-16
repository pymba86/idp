import {z} from "zod";

export const refreshTokenGuard = z.object({
    id: z.string().min(1).max(21),
    clientId: z.string().min(1).max(21),
    userId: z.string().min(1).max(21),
    userSessionId: z.string(),
    scope: z.string(),
    expiresAt: z.number()
})

export type RefreshToken = z.infer<typeof refreshTokenGuard>;

export const insertRefreshTokenGuard = refreshTokenGuard.partial({

})

export type InsertRefreshToken = z.infer<typeof insertRefreshTokenGuard>;