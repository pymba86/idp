import {z} from "zod";

export const userConsentGuard = z.object({
    id: z.string().min(1).max(21),
    userId: z.string(),
    clientId: z.string()
})

export type UserConsent = z.infer<typeof userConsentGuard>;

export const insertUserConsentGuard = userConsentGuard.partial({

})

export type InsertUserConsent = z.infer<typeof insertUserConsentGuard>;