import {z} from "zod";

export const registrationGuard = z.object({
    id: z.string().min(1).max(21),
    email: z.string(),
    password: z.string(),
})

export type Registration = z.infer<typeof registrationGuard>;

export const insertRegistrationGuard = registrationGuard.partial({

})

export type InsertRegistration = z.infer<typeof insertRegistrationGuard>;