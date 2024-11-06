import {ProviderMetadata} from "./definitions.js";
import {oidcProviderMetadata} from "./oidc.js";
import {ProviderType} from "@astoniq/idp-schemas";
import {ProviderError, ProviderErrorCodes} from "./error.js";
import {oauth2ProviderMetadata} from "./oauth2.js";

export const buildProviderMetadata = (type: ProviderType): ProviderMetadata => {
    switch (type) {
        case ProviderType.Oidc:
            return oidcProviderMetadata;
        case ProviderType.Oauth2:
            return oauth2ProviderMetadata
        default:
            throw new ProviderError(ProviderErrorCodes.NotImplemented)
    }
}