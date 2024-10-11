import {z} from "zod";
import {sessionStoreDataGuard} from "../foundations/index.js";

export const sessionGuard = z.object({
    id: z.string().min(1).max(21),
    httpOnly: z.boolean(),
    path: z.string(),
    domain: z.string().optional(),
    secure: z.boolean(),
    sameSite: z.enum(['lax', 'strict', 'none']),
    data: sessionStoreDataGuard.partial(),
    expiresAt: z.number(),
    remember: z.boolean(),
})

export type Session = z.infer<typeof sessionGuard>;

export const insertSessionGuard = sessionGuard;

export type InsertSession = z.infer<typeof insertSessionGuard>
