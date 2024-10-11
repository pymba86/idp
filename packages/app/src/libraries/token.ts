import {JWT} from "./jwt.js";
import {Code} from "@astoniq/idp-schemas";
import {generateStandardId} from "@astoniq/idp-shared";
import {JWTPayload} from "jose";
import {Queries} from "../queries/index.js";

export const createTokenLibrary = (options: {
    queries: Queries
    jwt: JWT
}) => {

    const {
        jwt,
        queries: {
            refreshTokens: {
                insertRefreshToken
            }
        }
    } = options

    const toEpochSeconds = (date: Date | number): number => {
        if (date instanceof Date) {
            return Math.floor(date.getTime() / 1000);
        }
        return Math.floor(date / 1000);
    }

    const generateAccessToken = async (code: Code) => {
        return jwt.sign({
            sub: code.userId,
            sid: code.userSessionId,
            exp: Date.now() + 100000000,
            scope: code.scope
        })
    }

    interface RefreshTokenClaims extends JWTPayload {
        jti: string;
        iat: number;
        sub: string;
        typ: string;
        scope: string;
        exp: number;
        sid?: string;
        mlt?: number;
    }

    enum RefreshTokenType {
        Offline = 'offline',
        Refresh = 'refresh'
    }

    const generateRefreshToken = async (code: Code) => {

        const {
            scope,
            userSessionId,
            userId
        } = code

        const id = generateStandardId();

        const scopes = scope.split(' ');

        const type = scopes.includes('offline_access')
            ? RefreshTokenType.Offline : RefreshTokenType.Refresh

        const now = Date.now()
        const expiresAt = now + 100000000

        const claims: RefreshTokenClaims = {
            jti: id,
            iat: now,
            exp: expiresAt,
            sub: userId,
            typ: type,
            scope: scope
        }

        // normal refresh token (associated with user session)
        if (type === RefreshTokenType.Refresh) {
            claims.sid = userSessionId
        }

        // offline refresh token (not related to user session)
        if (type === RefreshTokenType.Offline) {
            claims.mlt = toEpochSeconds(Date.now() + 10000)
        }

        if (type === RefreshTokenType.Refresh) {
            await insertRefreshToken({
                id,
                expiresAt,
                userSessionId,
                scope,
                type
            })
        } else {
            await insertRefreshToken({
                id,
                expiresAt,
                scope,
                type
            })
        }

        return jwt.sign(claims)
    }

    return {
        generateAccessToken,
        generateRefreshToken,
        toEpochSeconds
    }
}