import { createHash } from 'node:crypto';

import { type JWK, type KeyLike, exportJWK as joseExportJWK } from 'jose';

const getCalculateKidComponents = (jwk: JWK) => {
    switch (jwk.kty) {
        case 'RSA': {
            return {
                e: jwk.e,
                kty: 'RSA',
                n: jwk.n,
            };
        }

        case 'EC': {
            return {
                crv: jwk.crv,
                kty: 'EC',
                x: jwk.x,
                y: jwk.y,
            };
        }

        case 'OKP': {
            return {
                crv: jwk.crv,
                kty: 'OKP',
                x: jwk.x,
            };
        }
        default:
            throw new Error('Invalid JWK kty')
    }
};

const calculateKid = (jwk: JWK) => {
    const components = getCalculateKidComponents(jwk);

    return createHash('sha256').update(JSON.stringify(components)).digest().toString('base64url');
};

export const exportJWK = async (key: KeyLike | Uint8Array): Promise<JWK> => {
    const jwk = await joseExportJWK(key);

    return {
        ...jwk,
        kid: calculateKid(jwk),
    };
};