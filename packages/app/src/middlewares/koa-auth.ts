import {Middleware, Request} from "koa";
import {RequestError} from "../errors/index.js";
import {assertThat} from "../utils/assert-that.js";
import {IncomingHttpHeaders} from "node:http";
import {z} from 'zod'
import {IRouterParamContext} from "koa-router";
import {PredefinedScope} from "@astoniq/idp-shared";
import {JWT} from "../libraries/jwt.js";

const bearerTokenIdentifier = 'Bearer';

export const extractBearerTokenFromHeaders = ({authorization}: IncomingHttpHeaders) => {
    assertThat(
        authorization,
        new RequestError({code: 'authorization_header_missing', status: 401})
    );
    assertThat(
        authorization.startsWith(bearerTokenIdentifier),
        new RequestError(
            {code: 'authorization_token_type_not_supported', status: 401},
            {supportedTypes: [bearerTokenIdentifier]}
        )
    );

    return authorization.slice(bearerTokenIdentifier.length + 1);
};

interface TokenInfo {
    sub: string;
    scopes: string[]
}

export const verifyBearerTokenFromRequest = async (
    jwt: JWT,
    request: Request,
): Promise<TokenInfo> => {
    try {
        const {
            sub,
            scope = '',
        } = await jwt.verify(
            extractBearerTokenFromHeaders(request.headers)
        );

        assertThat(sub, new RequestError({code: 'jwt_sub_missing', status: 401}));

        return {sub, scopes: z.string().parse(scope).split(' ')};
    } catch (error: unknown) {
        if (error instanceof RequestError) {
            throw error;
        }

        if (error instanceof TypeError) {
            throw error;
        }

        throw new RequestError({code: 'unauthorized', status: 401}, error);
    }
};

export type Auth = {
    id: string;
    scopes: string[]
}

export type WithAuthContext<ContextT extends IRouterParamContext = IRouterParamContext> =
    ContextT & {
    auth: Auth;
};

export default function koaAuth<StateT, ContextT extends IRouterParamContext, BodyT>(
    jwt: JWT
): Middleware<
    StateT, WithAuthContext<ContextT>, BodyT> {
    return async (ctx, next) => {

        const {sub, scopes} = await verifyBearerTokenFromRequest(jwt, ctx.request);

        assertThat(
            scopes.includes(PredefinedScope.Console),
            new RequestError({code: 'forbidden', status: 403})
        )

        ctx.auth = {
            id: sub,
            scopes: scopes
        }

        return next();
    }
}