import {GetAuthorizationUri, GetUserInfo, ProviderMetadata} from "./definitions.js";
import {
    oauth2AuthResponseGuard,
    Oauth2ProviderConfig,
    oauth2ProviderConfigGuard,
    Oauth2TokenResponse,
    oauth2TokenResponseGuard,
    TokenEndpointResponseType, userProfileGuard,
    ProfileMap,
} from "@astoniq/idp-schemas";
import ky, {HTTPError, KyResponse} from "ky";
import qs from 'query-string';
import {
    constructAuthorizationUri,
    parseJson,
    parseJsonObject,
    requestTokenEndpoint,
    validateConfig
} from "./utils.js";
import {ProviderError, ProviderErrorCodes} from "./error.js";
import {assert} from "../utils/assert.js";
import {JsonObject} from "@astoniq/idp-shared";

const oauth2TokenResponseHandler = async (
    response: KyResponse,
    tokenEndpointResponseType: TokenEndpointResponseType
): Promise<Oauth2TokenResponse> => {

    const responseContent = await response.text();

    const result = oauth2TokenResponseGuard.safeParse(
        tokenEndpointResponseType === 'json'
            ? parseJson(responseContent)
            : qs.parse(responseContent)
    );

    if (!result.success) {
        throw new ProviderError(ProviderErrorCodes.InvalidResponse, result.error);
    }

    assert(
        result.data.access_token,
        new ProviderError(ProviderErrorCodes.AuthCodeInvalid, {
            message: 'Can not find `access_token` in token response!',
        })
    );

    return result.data;
};

export const getAccessToken = async (
    config: Oauth2ProviderConfig,
    data: unknown,
    redirectUri: string
) => {
    const result = oauth2AuthResponseGuard.safeParse(data);

    if (!result.success) {
        throw new ProviderError(ProviderErrorCodes.General, data);
    }

    const {code} = result.data;

    const {
        grantType,
        tokenEndpoint,
        tokenEndpointResponseType,
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
            redirectUri,
            clientId,
            clientSecret,
            code,
            ...customConfig,
        },
    });

    return oauth2TokenResponseHandler(tokenResponse, tokenEndpointResponseType);
};

const getAuthorizationUri: GetAuthorizationUri = async (options, setContext) => {

    const {config, state, redirectUri, action, providerId, baseUrl} = options

    validateConfig(config, oauth2ProviderConfigGuard);

    await setContext({
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
    } = config

    return constructAuthorizationUri(authorizationEndpoint, {
        responseType,
        responseMode,
        clientId,
        scope,
        redirectUri: baseUrl + '/callback',
        state,
        ...customConfig
    })
}

const userProfileMapping = (
    data: JsonObject,
    keyMapping: ProfileMap
) => {
    const mappedUserProfile = Object.fromEntries(
        Object.entries(keyMapping)
            .map(([destination, source]) => [destination, data[source]])
    );

    const result = userProfileGuard.safeParse(mappedUserProfile);

    if (!result.success) {
        throw new ProviderError(ProviderErrorCodes.InvalidResponse, result.error);
    }

    return result.data;
};

const getUserInfo: GetUserInfo = async (options) => {

    const {config, data, baseUrl} = options

    validateConfig(config, oauth2ProviderConfigGuard);

    assert(
        baseUrl,
        new ProviderError(ProviderErrorCodes.General, {
            message: "can not find 'baseUrl' from provider session.",
        })
    );

    const {access_token, token_type} = await getAccessToken(config, data, baseUrl + '/callback');

    try {
        const httpResponse = await ky.get(config.userInfoEndpoint, {
            headers: {
                authorization: `${token_type} ${access_token}`,
            },
            timeout: 5000,
        });

        const data = parseJsonObject(await httpResponse.text());

        return userProfileMapping(data, config.profileMap)

    } catch (error: unknown) {
        if (error instanceof HTTPError) {
            throw new ProviderError(ProviderErrorCodes.General, JSON.stringify(error.response.body));
        }

        throw error;
    }
}

export const oauth2ProviderMetadata: ProviderMetadata = {
    configGuard: oauth2ProviderConfigGuard,
    getUserInfo,
    getAuthorizationUri
}