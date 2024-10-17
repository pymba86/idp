import {JWT} from "./jwt.js";
import {generateStandardId} from "@astoniq/idp-shared";
import {Queries} from "../queries/index.js";
import {Client} from "@astoniq/idp-schemas";

export interface TokenInfo {
    scope: string,
    userId: string,
    clientId: string,
    userSessionId: string
}

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

    const generateAccessToken = async (info: TokenInfo, accessTokenId: string, expiresAt: number) => {
        return jwt.sign({
            jti: accessTokenId,
            sub: info.userId,
            sid: info.userSessionId,
            exp: expiresAt,
            scope: info.scope
        })
    }

    const generateClientAccessToken = async (client: Client, accessTokenId: string, scope: string, expiresAt: number) => {
        return jwt.sign({
            jti: accessTokenId,
            sub: client.id,
            exp: expiresAt,
            scope: scope
        })
    }

    const getAccessTokenExpiration = (now: number) => {
        return now + 60 * 15 * 1000 // 15 min
    }

    const getRefreshTokenExpiration = (now: number) => {
        return now + 60 * 60 * 24 * 30 * 1000 // 30 days
    }

    const generateRefreshToken = async (
        info: TokenInfo,
        accessTokenId: string,
        accessExpiresAt: number,
        expiresAt: number
    ) => {

        const {
            scope,
            userId,
            clientId,
            userSessionId
        } = info

        const id = generateStandardId();

        await insertRefreshToken({
            id,
            userId,
            clientId,
            accessTokenId,
            accessExpiresAt,
            expiresAt,
            userSessionId,
            scope,
        })

        return id
    }

    return {
        generateAccessToken,
        generateClientAccessToken,
        getRefreshTokenExpiration,
        getAccessTokenExpiration,
        generateRefreshToken
    }
}