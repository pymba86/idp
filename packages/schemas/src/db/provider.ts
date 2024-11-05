import {z} from "zod";
import {jsonObjectGuard, providerDomainsGuard, ProviderType} from "../foundations/index.js";

export const providerGuard = z.object({
    id: z.string().min(1).max(21),
    name: z.string().min(1).max(128),
    type: z.nativeEnum(ProviderType),
    link: z.boolean(),
    sso: z.boolean(),
    domains: providerDomainsGuard,
    config: jsonObjectGuard
})

export type Provider = z.infer<typeof providerGuard>;

export const insertProviderGuard = providerGuard.partial({
    link: true,
    sso: true
})

export type InsertProvider = z.infer<typeof insertProviderGuard>;