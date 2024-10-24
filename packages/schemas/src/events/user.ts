import {z} from "zod";

export const userRegisterEventGuard = z.object({
    email: z.string(),
    code: z.string()
})

export type UserRegisterEvent = z.infer<typeof userRegisterEventGuard>