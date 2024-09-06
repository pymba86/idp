import {z} from "zod";

export const clientMetadataGuard = z.object({
    redirectUris: z.string().array(),
    logoUri: z.string().optional()
})

export type ClientMetadata = z.infer<typeof clientMetadataGuard>