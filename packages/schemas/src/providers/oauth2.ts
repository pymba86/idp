import {z} from "zod";

export enum TokenEndpointAuthMethod {
    ClientSecretBasic = 'client_secret_basic',
    ClientSecretPost = 'client_secret_post',
}

export const oauth2ProviderConfigGuard = z.object({
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

export const oauth2AuthResponseGuard = z.object({
    code: z.string(),
    state: z.string().optional(),
});

export type Oauth2AuthResponse = z.infer<typeof oauth2AuthResponseGuard>;

export const oauth2AccessTokenResponseGuard = z.object({
    access_token: z.string(),
    token_type: z.string(),
    expires_in: z.number().optional(),
    refresh_token: z.string().optional(),
});

export type Oauth2AccessTokenResponse = z.infer<typeof oauth2AccessTokenResponseGuard>;