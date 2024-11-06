import {ZodType, ZodTypeDef} from "zod";
import {ProviderError, ProviderErrorCodes} from "./error.js";
import {removeUndefinedKeys} from "../utils/object.js";
import snakecaseKeys from "snakecase-keys";
import ky, {HTTPError} from 'ky';
import {
    jsonGuard, jsonObjectGuard,
    TokenEndpointAuthMethod
} from "@astoniq/idp-schemas";
import {Json, JsonObject} from "@astoniq/idp-shared";

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
    } & Record<string, string | undefined>;
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
        form: Record<string, string | undefined>;
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

export const parseJsonObject = (
    ...[jsonString, errorCode = ProviderErrorCodes.InvalidResponse, errorPayload]: Parameters<
        typeof parseJson
    >
): JsonObject => {
    try {
        return jsonObjectGuard.parse(JSON.parse(jsonString));
    } catch {
        throw new ProviderError(errorCode, errorPayload ?? jsonString);
    }
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
        responseMode: string,
        clientId: string
        scope?: string
        redirectUri: string
        state: string
    } & Record<string, string | undefined>
) =>
    `${authorizationEndpoint}?${new URLSearchParams(
        removeUndefinedKeys(snakecaseKeys(queryParameters))
    ).toString()}`