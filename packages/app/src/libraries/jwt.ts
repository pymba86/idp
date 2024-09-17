import {Buffer} from 'buffer';
import {Keys} from "../config/index.js";
import {CompactSign} from "jose";

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

export type JWT = ReturnType<typeof createJwtLibrary>

export const createJwtLibrary = (keys: Keys) => {

    const [jwk] = keys.privateJwks

    if (!jwk) {
        throw new Error('Private JWK required in jwt')
    }

    if (!jwk.kid) {
        throw new Error('missing or invalid JWK "kid" (Key ID) parameter');
    }

    const sign: <T extends JWTPayload = JWTPayload>(payload: T) => Promise<string> = async (payload) => {
        return new CompactSign(Buffer.from(JSON.stringify(payload)))
            .setProtectedHeader({
                kid: jwk.kid, typ: 'JWT', alg: 'ES384'
            })
            .sign(jwk)
    };

    return {sign};
};
