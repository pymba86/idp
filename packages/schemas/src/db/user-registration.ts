import {z} from "zod";

export const userRegistrationGuard = z.object({
    id: z.string().min(1).max(21),
    email: z.string(),
    password: z.string(),
    expiresAt: z.number()
})

export type UserRegistration = z.infer<typeof userRegistrationGuard>;

export const insertUserRegistrationGuard = userRegistrationGuard.partial({})

export type InsertUserRegistration = z.infer<typeof insertUserRegistrationGuard>;