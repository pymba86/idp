import * as crypto from "crypto";
import {nanoid} from "nanoid";
import {JWK} from "@astoniq/idp-schemas";

export type ExportJWK = (jwk: JWK) => JWK;

export const exportJWK: ExportJWK = (jwk) => {
    return {
        // https://datatracker.ietf.org/doc/html/rfc7517#section-4
        'kty': jwk.kty,
        'use': jwk.use,
        'alg': jwk.alg,
        'kid': jwk.kid,

        // https://datatracker.ietf.org/doc/html/rfc7518#section-6.2.1
        'crv': jwk.crv,
        'x': jwk.x,
        'y': jwk.y,

        // https://datatracker.ietf.org/doc/html/rfc7518#section-6.3.1
        'e': jwk.e,
        'n': jwk.n,
    };
};

export const generateJWK = async (): Promise<JWK> => {

    const kid = nanoid()

    const {privateKey} = crypto.generateKeyPairSync('ec', {
        namedCurve: 'P-384',
    });

    const key = privateKey.export({
        format: "jwk"
    });

    const jwk = {
        alg: 'ES384',
        kty: 'EC',
        use: 'sig',
        kid: kid,
    }

    return {...key, ...jwk};
}