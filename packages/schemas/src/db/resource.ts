import {z} from "zod";

export const resourceGuard = z.object({
    id: z.string().min(1).max(21),
    name: z.string(),
    description: z.string()
})

export type Resource = z.infer<typeof resourceGuard>;

export const insertResourceGuard = resourceGuard;

export type InsertResource = z.infer<typeof insertResourceGuard>
