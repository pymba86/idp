
import {generateStandardId} from "@astoniq/idp-shared";
import {ProviderMetadata, GetAuthorizationUri, GetUserInfo} from "./definitions.js";
import {constructAuthorizationUri, getIdToken, validateConfig} from "./utils.js";
import {ProviderError, ProviderErrorCodes} from "./error.js";
import {assert} from "../utils/assert.js";
import {idTokenProfileStandardClaimsGuard, oidcProviderConfigGuard} from "./schema.js";
import {conditional} from "../utils/conditional.js";

const getAuthorizationUri: GetAuthorizationUri = async (options, setContext) => {

    const {config, state, redirectUri} = options

    validateConfig(config, oidcProviderConfigGuard);

    const nonce = generateStandardId();

    await setContext({nonce, redirectUri})

    const {
        authorizationEndpoint,
        responseType,
        clientId,
        scope,
        customConfig,
        authRequestOptionalConfig
    } = config

    return constructAuthorizationUri(authorizationEndpoint, {
        responseType,
        clientId,
        scope,
        redirectUri,
        state,
        nonce,
        ...authRequestOptionalConfig,
        ...customConfig
    })
}

const getUserInfo: GetUserInfo = async (options, getContext) => {

    const {config, data} = options

    validateConfig(config, oidcProviderConfigGuard);

    const {nonce, redirectUri} = await getContext();

    assert(
        redirectUri,
        new ProviderError(ProviderErrorCodes.General, {
            message: "can not find 'redirectUri' from provider session.",
        })
    );

    const { id_token: idToken } = await getIdToken(config, data, redirectUri);

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

    const result = idTokenProfileStandardClaimsGuard.safeParse(protectedPayload);

    if (!result.success) {
        throw new ProviderError(ProviderErrorCodes.IdTokenInvalid, result.error);
    }

    const {
        sub: id,
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