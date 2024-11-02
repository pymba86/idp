import {ProviderContext, UserInfo} from "@astoniq/idp-schemas";
import {ZodType} from "zod";

export type GetContext = () => Promise<ProviderContext>;

export type SetContext = (session: ProviderContext) => Promise<void>;

export type GetUserInfoOptions = {
    data: unknown
    config: unknown
}

export type GetUserInfo = (options: GetUserInfoOptions, getContext: GetContext) => Promise<UserInfo>;

export type AuthorizationUriOptions = {
    state: string;
    redirectUri: string;
    providerId: string;
    config: unknown
}

export type GetAuthorizationUri = (options: AuthorizationUriOptions, setContext: SetContext) => Promise<string>

export type ProviderMetadata = {
    getUserInfo: GetUserInfo;
    getAuthorizationUri: GetAuthorizationUri;
    configGuard: ZodType;
}