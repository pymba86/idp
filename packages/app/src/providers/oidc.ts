
import {generateStandardId} from "@astoniq/idp-shared";
import {ProviderMetadata, GetAuthorizationUri, GetUserInfo} from "./definitions.js";
import {constructAuthorizationUri, getIdToken, validateConfig} from "./utils.js";
import {ConnectorError, ConnectorErrorCodes} from "./error.js";
import {assert} from "../utils/assert.js";
import {idTokenProfileStandardClaimsGuard, oidcProviderConfigGuard} from "./schema.js";
import {conditional} from "../utils/conditional.js";

const getAuthorizationUri: GetAuthorizationUri = async (options, setSession) => {

    const {config, state, redirectUri} = options

    validateConfig(config, oidcProviderConfigGuard);

    const nonce = generateStandardId();

    await setSession({nonce, redirectUri})

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

const getUserInfo: GetUserInfo = async (options, getSession) => {

    const {config, data} = options

    validateConfig(config, oidcProviderConfigGuard);

    const {nonce, redirectUri} = await getSession();

    assert(
        redirectUri,
        new ConnectorError(ConnectorErrorCodes.General, {
            message: "can not find 'redirectUri' from connector session.",
        })
    );

    const { id_token: idToken } = await getIdToken(config, data, redirectUri);

    if (!idToken) {
        throw new ConnectorError(ConnectorErrorCodes.IdTokenInvalid, {
            message: 'Cannot find ID Token.',
        });
    }

    const [compactHeader, compactPayload, compactSignature] = idToken.split('.');

    if (!compactHeader || !compactPayload || !compactSignature) {
        throw new ConnectorError(ConnectorErrorCodes.IdTokenInvalid, {
            message: "ID Token is invalid",
        });
    }

    const result = idTokenProfileStandardClaimsGuard.safeParse(compactPayload);

    if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.IdTokenInvalid, result.error);
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
            new ConnectorError(ConnectorErrorCodes.General, {
                message: 'Cannot find `nonce` in session storage.',
            })
        );

        assert(
            validationNonce === nonce,
            new ConnectorError(ConnectorErrorCodes.IdTokenInvalid, {
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