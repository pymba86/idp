import {z, ZodType} from "zod";

export enum ProviderType {
    Oidc = 'oidc'
}

export const providerDomainsGuard = z.array(z.string());

export type ProviderDomains = z.infer<typeof providerDomainsGuard>

export enum ProviderAction {
    Auth = 'auth',
    Link = 'link'
}

export type UserInfo = {
    id: string;
    email?: string;
}

export const userInfoGuard: ZodType<UserInfo> = z.object({
    id: z.string(),
    email: z.string().optional()
})
