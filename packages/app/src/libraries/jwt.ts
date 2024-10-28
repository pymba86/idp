import {base64url} from "../utils/buffer.js";
import {sign as signSync, verify as verifySync} from "crypto";
import {TextEncoder, promisify} from 'util';
import {Queries} from "../queries/index.js";
import {getConfigByKey} from "../queries/config.js";
import {BaseConfigKey} from "@astoniq/idp-schemas";

interface JWTPayload {
    sub: string;
    scope: string;
    jti: string;
    exp: number;
    sid?: string;
}

export type JWT = ReturnType<typeof createJwtLibrary>

export const createJwtLibrary = (
    options: {
        queries: Queries
    }
) => {

    const {
        queries: {
            pool
        }
    } = options

    const encoder = new TextEncoder();

    const cryptoSign = promisify(signSync);
    const cryptoVerify = promisify(verifySync);

    const digest = (algorithm: string): string => {
        switch (algorithm) {
            case 'ES384':
                return 'SHA-384';
            case 'ES256':
                return 'SHA-256';
            case 'ES512':
                return 'SHA-512';
            default:
                throw new Error(`The jwt alg ${algorithm} does not match the key's algorithm`)
        }
    };

    const sign = async <T extends JWTPayload = JWTPayload>(payload: T): Promise<string> => {

        const [jwk] = await getConfigByKey(pool, BaseConfigKey.Jwks)

        if (!jwk) {
            throw new Error('JWK required for jwt sign (jwks empty)')
        }

        const protectedHeader = {
            kid: jwk.kid,
            typ: 'JWT',
            alg: jwk.alg
        }

        const compactProtectedHeader = base64url(JSON.stringify(protectedHeader));

        const compactPayload = base64url(JSON.stringify(payload));

        const data = encoder.encode(`${compactProtectedHeader}.${compactPayload}`);

        const algorithm = digest(jwk.alg);

        const signature = await cryptoSign(
            algorithm,
            data,
            {key: jwk, format: 'jwk'});

        const compactSignature = signature.toString('base64url');

        return `${compactProtectedHeader}.${compactPayload}.${compactSignature}`;
    }

    const verify = async (jwt: string): Promise<JWTPayload> => {

        const [compactProtectedHeader, compactPayload, compactSignature] = jwt.split('.');

        if (!compactProtectedHeader) {
            throw new Error('The jwt header not contains in jwt')
        }

        const protectedHeader = JSON.parse(
            Buffer.from(compactProtectedHeader, 'base64url').toString());

        if (!compactPayload) {
            throw new Error('The jwt payload not contains in jwt')
        }

        const data = encoder.encode(`${compactProtectedHeader}.${compactPayload}`);

        if (!compactSignature) {
            throw new Error('The jwt signature not contains in jwt')
        }

        const signature = Buffer.from(compactSignature, 'base64url');

        const algorithm = digest(protectedHeader.alg)

        const jwks = await getConfigByKey(
            pool, BaseConfigKey.Jwks)

        const jwk = jwks.find(key => key.kid === protectedHeader.kid)

        if (!jwk) {
            throw new Error('The jwt kid not found in jwks')
        }

        const valid = cryptoVerify(
            algorithm,
            data,
            {key: jwk, format: 'jwk'},
            signature);

        if (!valid) {
            throw new Error("The jwt signature does not match the verification signature");
        }

        const payload = Buffer
            .from(compactPayload, 'base64url')
            .toString();

        return JSON.parse(payload)
    }


    return {sign, verify};
};
