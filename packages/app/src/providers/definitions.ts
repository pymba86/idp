import {z, ZodType} from "zod";

export type UserInfo = {
    id: string;
    email?: string;
}

export const userInfoGuard: ZodType<UserInfo> = z.object({
    id: z.string(),
    email: z.string().optional()
})

export const providerSessionGuard = z.object({
    nonce: z.string(),
    redirectUri: z.string(),
    providerId: z.string(),
    state: z.string()
}).partial()

export type ProviderSession = z.infer<typeof providerSessionGuard>;

export type GetSession = () => Promise<ProviderSession>;

export type SetSession = (session: ProviderSession) => Promise<void>;

export type GetUserInfoOptions = {
    data: unknown
    config: unknown
}

export type GetUserInfo = (options: GetUserInfoOptions, getSession: GetSession) => Promise<UserInfo>;

export type AuthorizationUriOptions = {
    state: string;
    redirectUri: string;
    providerId: string;
    config: unknown
}

export type GetAuthorizationUri = (options: AuthorizationUriOptions, setSession: SetSession) => Promise<string>

export type ProviderMetadata = {
    getUserInfo: GetUserInfo;
    getAuthorizationUri: GetAuthorizationUri;
    configGuard: ZodType;
}