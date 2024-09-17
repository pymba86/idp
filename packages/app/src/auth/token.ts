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
            }
        },
        libraries: {
            token
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

    const epoch = () => Math.floor(Date.now() / 1000);


    interface AuthorizationCodeResponse {
        tokenType: string;
        accessToken: string;
        scope: string;
        idToken?: string;
        refreshToken?: string;
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

        if (authorizationCode.expiresAt < epoch()) {
            await deleteAuthorizationCode(request.code);

            throw new InvalidGrant('the provided authorization code is invalid, expired or revoked');
        }

        if (authorizationCode.redirectUri !== request.redirectUri) {
            throw new InvalidRequest('the request includes an invalid value for parameter "redirect_uri"');
        }

        const accessToken = await token.generateAccessToken(authorizationCode)

        const refreshToken = await token.generateRefreshToken(authorizationCode)

        const response: AuthorizationCodeResponse = {
            tokenType: 'Bearer',
            accessToken,
            refreshToken,
            scope: authorizationCode.scope
        }

        const scopes = authorizationCode.scope.split(' ');

        if (scopes.includes('openid')) {
            response.idToken = await token.generateIdToken(authorizationCode)
        }

        await deleteAuthorizationCode(authorizationCode.id);

        ctx.body = response
    };

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
            default:
                await handleUnsupportedGrantType(request);
        }
    }
}