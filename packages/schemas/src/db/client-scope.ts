import {z} from "zod";

export const clientScopeGuard = z.object({
    id: z.string().min(1).max(21),
    clientId: z.string(),
    scopeId: z.string()
})

export type ClientScope = z.infer<typeof clientScopeGuard>;

export const insertClientScopeGuard = clientScopeGuard.partial({

})

export type InsertClientScope = z.infer<typeof insertClientScopeGuard>;