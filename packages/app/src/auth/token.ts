import {IRouterParamContext} from "koa-router";
import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Context, Middleware} from "koa";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";
import {parseParam} from "./query.js";
import {TokenRequest} from "./types.js";
import {HandleClientAuthentication} from "./client.js";
import {InvalidGrant, InvalidRequest, UnsupportedGrantType} from "./errors.js";
import {Libraries} from "../libraries/index.js";
import {generateStandardId} from "@astoniq/idp-shared";

export const makeHandleTokenPost = <StateT, ContextT extends IRouterParamContext>(options: {
    queries: Queries,
    handlers: Handlers,
    libraries: Libraries,
    clientAuthentication: HandleClientAuthentication
}): Middleware<StateT, WithInertiaContext<ContextT>> => {

    const {
        queries: {
            codes: {
                findAuthorizationCode,
                deleteAuthorizationCode
            },
            refreshTokens: {
                findRefreshTokenById,
                deleteRefreshTokenById
            }
        },
        libraries: {
            token: {
                generateAccessToken,
                getRefreshTokenExpiration,
                generateClientAccessToken,
                getAccessTokenExpiration,
                generateRefreshToken
            },
            client: {
                validateClientScopes
            }
        },
        clientAuthentication
    } = options

    const makeTokenRequest = (body: Record<string, string>): TokenRequest => {
        return {
            grantType: parseParam(body.grant_type),
            code: parseParam(body.code),
            redirectUri: parseParam(body.redirect_uri),
            clientId: parseParam(body.client_id),
            clientSecret: parseParam(body.client_secret),
            refreshToken: parseParam(body.refresh_token),
            scope: parseParam(body.scope)
        }
    }

    interface AuthorizationCodeResponse {
        tokenType: string;
        accessExpiresAt: number;
        accessToken: string;
        scope: string;
        refreshExpiresAt: number;
        refreshToken: string;
    }

    const handleAuthorizationCodeGrant = async (
        ctx: Context,
        request: TokenRequest
    ) => {
        const client = await clientAuthentication(request);

        if (!request.code) {
            throw new InvalidRequest('the request is missing a required parameter "code"');
        }

        if (!request.redirectUri) {
            throw new InvalidRequest('the request is missing a required parameter "redirect_uri"');
        }

        const authorizationCode = await findAuthorizationCode(request.code);

        if (!authorizationCode) {
            throw new InvalidGrant('the provided authorization code is invalid, expired or revoked');
        }

        if (authorizationCode.clientId != client.id) {
            throw new InvalidGrant('The client_id provided does not match the client_id from code.');
        }

        const now = Date.now()

        if (authorizationCode.expiresAt < now) {
            await deleteAuthorizationCode(request.code);

            throw new InvalidGrant('the provided authorization code is invalid, expired or revoked');
        }

        if (authorizationCode.redirectUri !== request.redirectUri) {
            throw new InvalidRequest('the request includes an invalid value for parameter "redirect_uri"');
        }

        const accessTokenId = generateStandardId()

        const accessExpiresAt = getAccessTokenExpiration(now)

        const accessToken = await generateAccessToken(authorizationCode, accessTokenId, accessExpiresAt)

        const refreshExpiresAt = getRefreshTokenExpiration(now)

        const refreshToken = await generateRefreshToken(
            authorizationCode,
            accessTokenId,
            accessExpiresAt,
            refreshExpiresAt
        )

        const response: AuthorizationCodeResponse = {
            tokenType: 'Bearer',
            accessExpiresAt,
            refreshExpiresAt,
            accessToken,
            refreshToken,
            scope: authorizationCode.scope
        }

        await deleteAuthorizationCode(authorizationCode.id);

        ctx.body = response
    };

    interface RefreshTokenResponse {
        tokenType: string;
        accessExpiresAt: number;
        accessToken: string;
        scope: string;
        refreshExpiresAt: number;
        refreshToken: string;
    }

    const handleRefreshTokenGrant = async (
        ctx: Context,
        request: TokenRequest
    ) => {
        const client = await clientAuthentication(request);

        if (!request.refreshToken) {
            throw new InvalidRequest('the request is missing a required parameter "refresh_token"');
        }

        const currentRefreshToken = await findRefreshTokenById(request.refreshToken, client.id)

        if (!currentRefreshToken) {
            throw new InvalidGrant('the provided refresh token is invalid, expired or revoked');
        }

        const now = Date.now()

        if (currentRefreshToken.expiresAt < now) {
            throw new InvalidGrant('the provided refresh token is invalid, expired or revoked');
        }

        const accessTokenId = generateStandardId()

        const accessExpiresAt = getAccessTokenExpiration(now)

        const accessToken = await generateAccessToken(currentRefreshToken, accessTokenId, accessExpiresAt)

        const refreshExpiresAt = getRefreshTokenExpiration(now)

        const refreshToken = await generateRefreshToken(
            currentRefreshToken,
            accessTokenId,
            accessExpiresAt,
            refreshExpiresAt
        )

        const response: RefreshTokenResponse = {
            tokenType: 'Bearer',
            accessExpiresAt,
            refreshExpiresAt,
            accessToken,
            refreshToken,
            scope: currentRefreshToken.scope
        }

        await deleteRefreshTokenById(currentRefreshToken.id, client.id)

        ctx.body = response
    }

    interface ClientCredentialsResponse {
        tokenType: string;
        accessExpiresAt: number;
        accessToken: string;
        scope: string;
    }

    const handleClientCredentialsGrant = async (
        ctx: Context,
        request: TokenRequest
    ) => {
        const client = await clientAuthentication(request);

        if (request.scope) {
            await validateClientScopes(client, request.scope);
        } else {
            throw new InvalidRequest("The 'scope' parameter is missing.");
        }

        const now = Date.now()

        const accessExpiresAt = getAccessTokenExpiration(now)

        const accessTokenId = generateStandardId()

        const accessToken = await generateClientAccessToken(client, accessTokenId, request.scope, accessExpiresAt)

        const response: ClientCredentialsResponse = {
            tokenType: 'Bearer',
            accessExpiresAt,
            accessToken,
            scope: request.scope
        }

        ctx.body = response
    }

    const handleUnsupportedGrantType = async (req: TokenRequest) => {

        await clientAuthentication(req);

        switch (req.grantType) {
            case undefined:
                throw new InvalidRequest('the request is missing a required parameter "grant_type"');
            default:
                throw new UnsupportedGrantType(req.grantType);
        }
    }

    return async (ctx) => {

        const request = makeTokenRequest(ctx.request.body)

        switch (request.grantType) {
            case 'authorization_code':
                await handleAuthorizationCodeGrant(ctx, request);
                break
            case 'refresh_token':
                await handleRefreshTokenGrant(ctx, request);
                break
            case 'client_credentials':
                await handleClientCredentialsGrant(ctx, request);
                break
            default:
                await handleUnsupportedGrantType(request);
        }
    }
}