import {z} from "zod";

export const scopeGuard = z.object({
    id: z.string().min(1).max(21),
    name: z.string(),
    description: z.string()
})

export type Scope = z.infer<typeof scopeGuard>;

export const insertScopeGuard = scopeGuard;

export type InsertScope = z.infer<typeof insertScopeGuard>
