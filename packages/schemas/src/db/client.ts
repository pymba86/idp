import {z} from "zod";
import {clientMetadataGuard} from "../foundations/index.js";

export const clientGuard = z.object({
    id: z.string().min(1).max(21),
    name: z.string().min(1).max(256),
    secret: z.string().min(1).max(64),
    description: z.string().min(1).max(256),
    consent: z.boolean(),
    metadata: clientMetadataGuard
})

export type Client = z.infer<typeof clientGuard>;

export const insertClientGuard = clientGuard.partial({

})

export type InsertClient = z.infer<typeof insertClientGuard>;