import {BaseConfigKey, BaseConfigType} from "@astoniq/idp-schemas";
import * as crypto from "crypto";
import {createLocalJWKSet} from "jose";
import {exportJWK} from "../utils/jwks.js";

export type Keys = Awaited<ReturnType<typeof loadKeysFromBaseConfig>>

export const loadKeysFromBaseConfig = async (configs: BaseConfigType) => {

    const privateKeys = configs[BaseConfigKey.PrivateKeys].map(({value}) =>
        crypto.createPrivateKey(value)
    )

    const publicKeys = privateKeys.map(
        key => crypto.createPublicKey(key));

    const privateJwks = await Promise.all(
        privateKeys.map(async (key) => exportJWK(key)))

    const publicJwks = await Promise.all(
        privateKeys.map(async (key) => exportJWK(key)));

    const localJWKSet = createLocalJWKSet({keys: publicJwks})

    return {
        privateKeys,
        publicKeys,
        privateJwks,
        publicJwks,
        localJWKSet
    }
}