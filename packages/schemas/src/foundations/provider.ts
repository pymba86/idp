import {z, ZodType} from "zod";

export enum ProviderType {
    Oidc = 'oidc'
}

export enum ProviderAction {
    Auth = 'auth'
}

export type UserInfo = {
    id: string;
    email?: string;
}

export const userInfoGuard: ZodType<UserInfo> = z.object({
    id: z.string(),
    email: z.string().optional()
})
