import {z} from "zod";

export enum TokenEndpointAuthMethod {
    ClientSecretBasic = 'client_secret_basic',
    ClientSecretPost = 'client_secret_post',
}

export const profileMapGuard = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
});

export type ProfileMap = z.input<typeof profileMapGuard>;

export const userProfileGuard = z.object({
    id: z.string().or(z.number()).transform(String),
    name: z.string().optional(),
    email: z.string().optional(),
});

const tokenEndpointResponseTypeGuard = z
    .enum(['query-string', 'json'])
    .optional()
    .default('query-string');

export type TokenEndpointResponseType = z.input<typeof tokenEndpointResponseTypeGuard>;

export const oauth2ConfigGuard = z.object({
    responseType: z.literal('code'),
    responseMode: z.literal('query'),
    grantType: z.literal('authorization_code'),
    authorizationEndpoint: z.string(),
    tokenEndpoint: z.string(),
    clientId: z.string(),
    clientSecret: z.string(),
    tokenEndpointAuthMethod: z.nativeEnum(TokenEndpointAuthMethod),
    scope: z.string().optional(),
})

export const oauth2ProviderConfigGuard = oauth2ConfigGuard.extend({
    userInfoEndpoint: z.string(),
    tokenEndpointResponseType: tokenEndpointResponseTypeGuard,
    profileMap: profileMapGuard,
    customConfig: z.record(z.string()).optional(),
});

export type Oauth2ProviderConfig = z.infer<typeof oauth2ProviderConfigGuard>;

export const oauth2AuthResponseGuard = z.object({
    code: z.string(),
    state: z.string().optional(),
}).and(z.record(z.string()));

export type Oauth2AuthResponse = z.infer<typeof oauth2AuthResponseGuard>;

export const oauth2TokenResponseGuard = z.object({
    access_token: z.string(),
    token_type: z.string(),
    expires_in: z.number().optional(),
    refresh_token: z.string().optional(),
});

export type Oauth2TokenResponse = z.infer<typeof oauth2TokenResponseGuard>;