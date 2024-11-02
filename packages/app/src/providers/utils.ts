import {ZodType, ZodTypeDef} from "zod";
import {ProviderError, ProviderErrorCodes} from "./error.js";
import {removeUndefinedKeys} from "../utils/object.js";
import snakecaseKeys from "snakecase-keys";
import ky, {HTTPError, KyResponse} from 'ky';
import {TokenEndpointAuthMethod} from "./oauth2.js";
import {AccessTokenResponse, accessTokenResponseGuard, authResponseGuard, OidcConnectorConfig} from "./schema.js";
import {jsonGuard} from "@astoniq/idp-schemas";
import {Json} from "@astoniq/idp-shared";

type TokenEndpointAuthOptions = {
    method: TokenEndpointAuthMethod;
};

export type RequestTokenEndpointOptions = {
    tokenEndpoint: string;
    tokenEndpointAuthOptions: TokenEndpointAuthOptions;
    tokenRequestBody: {
        grantType: string;
        code: string;
        redirectUri: string;
        clientId: string;
        clientSecret: string;
    } & Record<string, string>;
    timeout?: number;
};

export const requestTokenEndpoint = async ({
                                               tokenEndpoint,
                                               tokenEndpointAuthOptions,
                                               tokenRequestBody,
                                               timeout,
                                           }: RequestTokenEndpointOptions) => {
    const postTokenEndpoint = async ({
                                         form,
                                         headers,
                                     }: {
        form: Record<string, string>;
        headers?: Record<string, string>;
    }) => {
        try {
            return await ky.post(tokenEndpoint, {
                headers,
                body: new URLSearchParams(removeUndefinedKeys(snakecaseKeys(form))),
                timeout,
            });
        } catch (error: unknown) {
            if (error instanceof HTTPError) {
                throw new ProviderError(ProviderErrorCodes.General, JSON.stringify(error.response.body));
            }

            throw error;
        }
    };

    const { clientId, clientSecret, ...requestBodyWithoutClientCredentials } = tokenRequestBody;

    switch (tokenEndpointAuthOptions.method) {
        case TokenEndpointAuthMethod.ClientSecretBasic: {
            return postTokenEndpoint({
                form: requestBodyWithoutClientCredentials,
                headers: {
                    Authorization: `Basic ${
                        Buffer.from(`${clientId}:${clientSecret}`)
                            .toString('base64')}`,
                },
            });
        }
        case TokenEndpointAuthMethod.ClientSecretPost: {
            return postTokenEndpoint({
                form: tokenRequestBody,
            });
        }
    }
};

export const parseJson = (
    jsonString: string,
    errorCode: ProviderErrorCodes = ProviderErrorCodes.InvalidResponse,
    errorPayload?: unknown
): Json => {
    try {
        return jsonGuard.parse(JSON.parse(jsonString));
    } catch {
        throw new ProviderError(errorCode, errorPayload ?? jsonString);
    }
};

const accessTokenResponseHandler = async (response: KyResponse): Promise<AccessTokenResponse> => {
    const result = accessTokenResponseGuard.safeParse(parseJson(await response.text()));

    if (!result.success) {
        throw new ProviderError(ProviderErrorCodes.InvalidResponse, result.error);
    }

    return result.data;
};

export const getIdToken = async (
    config: OidcConnectorConfig,
    data: unknown,
    redirectUri: string
) => {
    const result = authResponseGuard.safeParse(data);

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

    return accessTokenResponseHandler(tokenResponse);
};

export function validateConfig<Output, Input = Output>(
    config: unknown,
    guard: ZodType<Output, ZodTypeDef, Input>
): asserts config is Output {
    const result = guard.safeParse(config);

    if (!result.success) {
        throw new ProviderError(ProviderErrorCodes.InvalidConfig, result.error);
    }
}

export const constructAuthorizationUri = (
    authorizationEndpoint: string,
    queryParameters: {
        responseType: string,
        clientId: string
        scope?: string
        redirectUri: string
        state: string
    } & Record<string, string>
) =>
    `${authorizationEndpoint}?${new URLSearchParams(
        removeUndefinedKeys(snakecaseKeys(queryParameters))
    ).toString()}`