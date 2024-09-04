import {z} from "zod";

export const userSessionGuard = z.object({
    id: z.string().min(1).max(21),
    userId: z.string()
})

export type UserSession = z.infer<typeof userSessionGuard>;

export const insertUserSessionGuard = userSessionGuard.partial({

})

export type InsertUserSession = z.infer<typeof insertUserSessionGuard>;