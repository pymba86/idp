import {generateStandardId} from "@astoniq/idp-shared";
import {ProviderMetadata, GetAuthorizationUri, GetUserInfo} from "./definitions.js";
import {constructAuthorizationUri, parseJson, requestTokenEndpoint, validateConfig} from "./utils.js";
import {ProviderError, ProviderErrorCodes} from "./error.js";
import {assert} from "../utils/assert.js";
import {conditional} from "../utils/conditional.js";
import {
    OidcTokenResponse,
    oidcTokenResponseGuard,
    oidcAuthResponseGuard,
    idTokenClaimsGuard,
    OidcProviderConfig,
    oidcProviderConfigGuard
} from "@astoniq/idp-schemas";
import {KyResponse} from "ky";

const oidcTokenResponseHandler = async (response: KyResponse): Promise<OidcTokenResponse> => {

    const result = oidcTokenResponseGuard.safeParse(
        parseJson(await response.text()));

    if (!result.success) {
        throw new ProviderError(ProviderErrorCodes.InvalidResponse, result.error);
    }

    return result.data;
};

export const getIdToken = async (
    config: OidcProviderConfig,
    data: unknown,
    redirectUri: string
) => {
    const result = oidcAuthResponseGuard.safeParse(data);

    if (!result.success) {
        throw new ProviderError(ProviderErrorCodes.General, data);
    }

    const { code } = result.data;

    const {
        tokenEndpoint,
        grantType,
        clientId,
        clientSecret,
        tokenEndpointAuthMethod,
        customConfig,
    } = config;

    const tokenResponse = await requestTokenEndpoint({
        tokenEndpoint,
        tokenEndpointAuthOptions: {
            method: tokenEndpointAuthMethod,
        },
        tokenRequestBody: {
            grantType,
            code,
            redirectUri,
            clientId,
            clientSecret,
            ...customConfig,
        },
    });

    return oidcTokenResponseHandler(tokenResponse);
};

const getAuthorizationUri: GetAuthorizationUri = async (options, setContext) => {

    const {config, state, redirectUri, action, providerId, baseUrl} = options

    validateConfig(config, oidcProviderConfigGuard);

    const nonce = generateStandardId();

    await setContext({
        nonce,
        state,
        redirectUri,
        action,
        providerId,
    })

    const {
        authorizationEndpoint,
        responseType,
        responseMode,
        clientId,
        scope,
        customConfig,
        authRequestOptionalConfig
    } = config

    return constructAuthorizationUri(authorizationEndpoint, {
        responseType,
        responseMode,
        clientId,
        scope,
        redirectUri: baseUrl + '/callback',
        state,
        nonce,
        ...authRequestOptionalConfig,
        ...customConfig
    })
}

const getUserInfo: GetUserInfo = async (options, getContext) => {

    const {config, data, baseUrl} = options

    validateConfig(config, oidcProviderConfigGuard);

    const {nonce} = await getContext();

    assert(
        baseUrl,
        new ProviderError(ProviderErrorCodes.General, {
            message: "can not find 'baseUrl' from provider session.",
        })
    );

    const {id_token: idToken} = await getIdToken(config, data,  baseUrl + '/callback');

    if (!idToken) {
        throw new ProviderError(ProviderErrorCodes.IdTokenInvalid, {
            message: 'Cannot find ID Token.',
        });
    }

    const [compactHeader, compactPayload, compactSignature] = idToken.split('.');

    if (!compactHeader || !compactPayload || !compactSignature) {
        throw new ProviderError(ProviderErrorCodes.IdTokenInvalid, {
            message: "ID Token is invalid",
        });
    }

    const protectedPayload = JSON.parse(
        Buffer.from(compactPayload, 'base64url').toString());

    const mappedUserClaims = Object.fromEntries(
        Object.entries(config.idTokenClaimsMapConfig)
            .map(([destination, source]) => [destination, protectedPayload[source]])
    );

    const result = idTokenClaimsGuard.safeParse(mappedUserClaims);

    if (!result.success) {
        throw new ProviderError(ProviderErrorCodes.IdTokenInvalid, result.error);
    }

    const {
        id,
        name,
        email,
        nonce: validationNonce,
    } = result.data;

    if (validationNonce) {
        assert(
            nonce,
            new ProviderError(ProviderErrorCodes.General, {
                message: 'Cannot find `nonce` in session storage.',
            })
        );

        assert(
            validationNonce === nonce,
            new ProviderError(ProviderErrorCodes.IdTokenInvalid, {
                message: 'ID Token validation failed due to `nonce` mismatch.',
            })
        );
    }

    return {
        id,
        name: conditional(name),
        email: conditional(email)
    }
}


export const oidcProviderMetadata: ProviderMetadata = {
    configGuard: oidcProviderConfigGuard,
    getUserInfo,
    getAuthorizationUri
}