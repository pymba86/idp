import {JsonWebKey, KeyObject} from 'crypto';
import {TextEncoder, promisify} from 'util';
import {Buffer} from 'buffer';

import {base64url} from '../utils/buffer.js';

const {createPrivateKey, sign: signSync, verify: verifySync} = await import('crypto');

const sign = promisify(signSync);
const verify = promisify(verifySync);

type Algorithm = 'EdDSA' | 'RS256';

const encoder = new TextEncoder();

const digest = (algorithm: Algorithm) => {
    switch (algorithm) {
        case 'RS256':
            return 'sha256';
        case 'EdDSA':
            return undefined;
    }
};

interface JWSProtectedHeader {
    alg: Algorithm;

    [K: string]: unknown;
}

interface JWSPayload {
    [K: string]: unknown;
}

interface JWS {
    sign: (protectedHeader: JWSProtectedHeader, payload: JWSPayload, key: KeyObject) => Promise<string>;
    verify: (jws: string, key: KeyObject) => Promise<boolean>;
}

export const jws: JWS = {
    sign: async (protectedHeader, payload, key) => {
        const compactProtectedHeader = base64url(JSON.stringify(protectedHeader));

        const compactPayload = base64url(JSON.stringify(payload));

        const data = encoder.encode(`${compactProtectedHeader}.${compactPayload}`);

        const signature = await sign(digest(protectedHeader.alg), data, key);

        const compactSignature = signature.toString('base64url');

        return `${compactProtectedHeader}.${compactPayload}.${compactSignature}`;
    },
    verify: (jws, key) => {
        const [compactProtectedHeader, compactPayload, compactSignature] = jws.split('.');

        if (!compactProtectedHeader) {
            throw new Error('missing JWT "header" parameter')
        }

        const protectedHeader = JSON.parse(Buffer.from(compactProtectedHeader, 'base64url').toString());

        if (!compactPayload) {
            throw new Error('missing JWT "payload" parameter')
        }

        const data = encoder.encode(`${compactProtectedHeader}.${compactPayload}`);

        if (!compactSignature) {
            throw new Error('missing JWT "signature" parameter')
        }

        const signature = Buffer.from(compactSignature, 'base64url');

        return verify(digest(protectedHeader.alg), data, key, signature);
    },
};

interface JWTPayload {
    iss?: string;
    sub?: string;
    aud?: string | string[];
    jti?: string;
    nbf?: number;
    exp?: number;
    iat?: number;

    [K: string]: unknown;
}

export const createJwtLibrary = async (jwk: JsonWebKey, payload: JWTPayload): Promise<string> => {

    switch (jwk.alg) {
        case 'RS256':
        case 'EdDSA':
            break;
        case undefined:
            throw new Error('missing JWK "alg" (algorithm) parameter');
        default:
            throw new Error(`invalid JWK "alg" (algorithm) parameter "${jwk.alg}"`);
    }

    if (typeof jwk.kid !== 'string') {
        throw new Error('missing or invalid JWK "kid" (Key ID) parameter');
    }

    const key = createPrivateKey({key: jwk, format: 'jwk'});

    const header = {
        kid: jwk.kid, typ: 'JWT', alg: jwk.alg
    }

    return jws.sign(header, payload, key);
};

export type ExportJWK = (jwk: JsonWebKey) => JsonWebKey;

export const exportJWK: ExportJWK = (jwk) => {
    const key: JsonWebKey = {
        // https://datatracker.ietf.org/doc/html/rfc7517#section-4
        'kty': jwk.kty,
        'use': jwk.use,
        'key_ops': jwk.key_ops,
        'alg': jwk.alg,
        'kid': jwk.kid,
        'x5u': jwk.x5u,
        'x5c': jwk.x5c,
        'x5t': jwk.x5t,
        'x5t#S256': jwk['x5t#S256'],

        // https://datatracker.ietf.org/doc/html/rfc7518#section-6.2.1
        'crv': jwk.crv,
        'x': jwk.x,
        'y': jwk.y,

        // https://datatracker.ietf.org/doc/html/rfc7518#section-6.3.1
        'e': jwk.e,
        'n': jwk.n,
    };

    return JSON.parse(JSON.stringify(key));
};