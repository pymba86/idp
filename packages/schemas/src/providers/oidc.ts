import {z} from "zod";
import {oauth2ConfigGuard} from "./oauth2.js";

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

export const idTokenClaimsMapGuard = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    nonce: z.string(),
});

export const idTokenClaimsGuard = z.object({
    id: z.string().or(z.number()).transform(String),
    name: z.string().optional(),
    email: z.string().optional(),
    nonce: z.string().optional(),
});

export const oidcProviderConfigGuard = oauth2ConfigGuard.extend({
    scope: z.string().transform(scopePostProcessor),
    authRequestOptionalConfig: authRequestOptionalConfigGuard.optional(),
    customConfig: z.record(z.string()).optional(),
    idTokenClaimsMapConfig: idTokenClaimsMapGuard
})

export type OidcProviderConfig = z.infer<typeof oidcProviderConfigGuard>;

export const oidcAuthResponseGuard = z
    .object({
        code: z.string(),
        state: z.string().optional(),
    })
    .catchall(z.string());

export type OidcAuthResponse = z.infer<typeof oidcAuthResponseGuard>;

export const oidcTokenResponseGuard = z.object({
    id_token: z.string(),
    access_token: z.string().optional(),
    token_type: z.string().optional(),
    expires_in: z.number().optional(),
    refresh_token: z.string().optional(),
    scope: z.string().optional(),
    code: z.string().optional(),
});

export type OidcTokenResponse = z.infer<typeof oidcTokenResponseGuard>;
