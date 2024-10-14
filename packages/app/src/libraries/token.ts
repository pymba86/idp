import {JWT} from "./jwt.js";
import {generateStandardId} from "@astoniq/idp-shared";
import {Queries} from "../queries/index.js";

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

    const generateAccessToken = async (info: TokenInfo, expiresAt: number) => {
        return jwt.sign({
            sub: info.userId,
            sid: info.userSessionId,
            exp: expiresAt,
            scope: info.scope
        })
    }

    const getAccessTokenExpiration = (now: number) => {
        return now +  60 * 15 * 1000 // 15 min
    }

    const getRefreshTokenExpiration = (now: number) => {
        return now + 60 * 60 * 24 * 30 * 1000 // 30 days
    }

    const generateRefreshToken = async (info: TokenInfo, expiresAt: number) => {

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
            expiresAt,
            userSessionId,
            scope,
        })

        return id
    }

    return {
        generateAccessToken,
        getRefreshTokenExpiration,
        getAccessTokenExpiration,
        generateRefreshToken
    }
}