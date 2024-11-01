import {z} from "zod";
import {oauth2ProviderConfigGuard} from "./oauth2.js";

const scopeOpenid = 'openid';
export const delimiter = /[ +]/;

export const scopePostProcessor = (scope: string) => {
    const splitScopes = scope.split(delimiter).filter(Boolean);

    if (!splitScopes.includes(scopeOpenid)) {
        return [...splitScopes, scopeOpenid].join(' ');
    }

    return scope;
};

export const authRequestOptionalConfigGuard = z
    .object({
        responseMode: z.string(),
        display: z.string(),
        prompt: z.string(),
        maxAge: z.string(),
        idTokenHint: z.string(),
        loginHint: z.string(),
        acrValues: z.string(),
    })
    .partial();

export const idTokenProfileStandardClaimsGuard = z.object({
    sub: z.string(),
    name: z.string().nullish(),
    email: z.string().nullish(),
    nonce: z.string().nullish(),
});

export const oidcProviderConfigGuard = oauth2ProviderConfigGuard.extend({
    scope: z.string().transform(scopePostProcessor),
    authRequestOptionalConfig: authRequestOptionalConfigGuard.optional(),
    customConfig: z.record(z.string()).optional(),
})

export type OidcConnectorConfig = z.infer<typeof oidcProviderConfigGuard>;

export const authResponseGuard = z
    .object({
        code: z.string(),
        state: z.string().optional(),
    })
    .catchall(z.string());

export type AuthResponse = z.infer<typeof authResponseGuard>;

export const accessTokenResponseGuard = z.object({
    id_token: z.string(),
    access_token: z.string().optional(),
    token_type: z.string().optional(),
    expires_in: z.number().optional(),
    refresh_token: z.string().optional(),
    scope: z.string().optional(),
    code: z.string().optional(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;
