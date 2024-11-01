import {ProviderMetadata} from "./definitions.js";
import {oidcProviderMetadata} from "./oidc.js";
import {ProviderType} from "@astoniq/idp-schemas";

export const buildProviderMetadata = (type: ProviderType): ProviderMetadata => {
    switch (type) {
        case ProviderType.Oidc:
            return oidcProviderMetadata
    }
}