import {ProviderMetadata} from "./definitions.js";
import {oidcProviderMetadata} from "./oidc.js";
import {ProviderType} from "@astoniq/idp-schemas";
import {ProviderError, ProviderErrorCodes} from "./error.js";

export const buildProviderMetadata = (type: ProviderType): ProviderMetadata => {
    switch (type) {
        case ProviderType.Oidc:
            return oidcProviderMetadata
        default:
            throw new ProviderError(ProviderErrorCodes.NotImplemented)
    }
}