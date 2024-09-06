import {z} from "zod";

export const userGuard = z.object({
    id: z.string().min(1).max(21),
    email: z.string(),
    password: z.string()
})

export type User = z.infer<typeof userGuard>;

export const insertUserGuard = userGuard.partial({

})

export type InsertUser = z.infer<typeof insertUserGuard>;