import {z} from "zod";
import {jsonObjectGuard} from "../foundations/json.js";

export const systemGuard = z.object({
    key: z.string().min(1).max(256),
    value: jsonObjectGuard,
})

export type System = z.infer<typeof systemGuard>;

export const insertSystemGuard = systemGuard;

export type InsertSystem = z.infer<typeof insertSystemGuard>