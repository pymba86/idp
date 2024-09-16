import {z} from "zod";
import {jsonObjectGuard} from "../foundations/json.js";

export const configGuard = z.object({
    key: z.string().min(1).max(256),
    value: jsonObjectGuard,
})

export type Config = z.infer<typeof configGuard>;

export const insertConfigGuard = configGuard;

export type InsertConfig = z.infer<typeof insertConfigGuard>
