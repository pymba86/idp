import {z} from "zod";

export const userProviderGuard = z.object({
    id: z.string().min(1).max(21),
    userId: z.string().min(1).max(21),
    providerId: z.string().min(1).max(21),
    identityId: z.string().min(1).max(128)
})

export type UserProvider = z.infer<typeof userProviderGuard>;

export const insertUserProviderGuard = userProviderGuard.partial({

})

export type InsertUserProvider = z.infer<typeof insertUserProviderGuard>;