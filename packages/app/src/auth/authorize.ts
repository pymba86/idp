import {Context, Middleware} from "koa";
import {ParsedUrlQuery} from "querystring";
import {Queries} from "../queries/index.js";
import {Client, ClientMetadata} from "@astoniq/idp-schemas";
import {InvalidRequest, InvalidScope, OAuth2ServerError, ServerError} from "./errors.js";
import {Handlers} from "../handlers/index.js";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";
import {IRouterParamContext} from "koa-router";
import {parseParam} from "./query.js";
import {AuthorizationRequest} from "./types.js";

export const makeHandleAuthorization = <StateT, ContextT extends IRouterParamContext>(options: {
    queries: Queries,
    handlers: Handlers
}): Middleware<StateT, WithInertiaContext<ContextT>> => {

    const {
        queries: {
            clients: {
                findClientById,
            },
            userSessions: {
                findUserSessionById
            }
        },
        handlers: {
            getSession
        }
    } = options

    const makeAuthorizationRequest = (query: ParsedUrlQuery): AuthorizationRequest => {
        return {
            responseType: parseParam(query.response_type),
            responseMode: parseParam(query.response_mode),
            clientId: parseParam(query.client_id),
            redirectUri: parseParam(query.redirect_uri),
            scope: parseParam(query.scope)
        }
    }

    const handleUnsupportedResponseType = async (req: AuthorizationRequest) => {
        const client = await handleClientAuthentication(req);

        if (req.redirectUri) {
            await validateRedirectUri(client.metadata, req.redirectUri);
        } else {
            throw new InvalidRequest('the request is missing a required parameter "redirect_uri"');
        }
    };

    const handleClientAuthentication = async (req: AuthorizationRequest): Promise<Client> => {
        if (!req.clientId) {
            throw new InvalidRequest('the request is missing a required parameter "client_id"');
        }

        const client = await findClientById(req.clientId);

        if (!client) {
            throw new InvalidRequest('the request includes an invalid value for parameter "client_id"');
        }

        return client;
    };

    const validateRedirectUri = async (metadata: ClientMetadata, redirectUri: string) => {
        try {
            new URL(redirectUri);
        } catch {
            throw new InvalidRequest('the request includes an invalid value for parameter "redirect_uri"');
        }
        if (!metadata.redirectUris.includes(redirectUri)) {
            throw new InvalidRequest('the request includes an invalid value for parameter "redirect_uri"');
        }
    }

    const supportedScopes = [
        'email'
    ]

    const validateScope = (scope: string) => {
        const scopes = scope.split(' ');

        if (scopes.some((scope) => !supportedScopes.includes(scope))) {
            throw new InvalidScope(scope);
        }
    };

    const responseModes = [
        'query',
        'fragment',
        'form_post'
    ]

    const handleCodeResponseType = async (
        ctx: Context,
        req: AuthorizationRequest,
    ) => {

        const client = await handleClientAuthentication(req);

        if (req.redirectUri) {
            await validateRedirectUri(client.metadata, req.redirectUri);
        } else {
            throw new InvalidRequest('the request is missing a required parameter "redirect_uri"');
        }
        if (req.responseMode) {
            if (!responseModes.includes(req.responseMode)) {
                throw new InvalidRequest(
                    "Please use 'query,' 'fragment,' or 'form_post' as the response_mode value.");
            }
        } else {
            throw new InvalidRequest("The 'response_mode' parameter is missing.");
        }

        if (req.scope) {
            validateScope(req.scope);
        } else {
            throw new InvalidRequest("The 'scope' parameter is missing.");
        }

        const session = await getSession(ctx)

        const {
            data: {
                userSessionId
            }
        } = session

        if (userSessionId) {

            const userSession = await findUserSessionById(userSessionId)

            if (!userSession) {
                throw new InvalidRequest("user session not found");
            }

            session.data.authContext = {
                ...req,
                authCompleted: true,
                userId: userSession.userId
            }

            await session.commit()

            ctx.redirect(`/auth/consent`);
            return;
        }

        session.data.authContext = req

        await session.commit()

        ctx.redirect(`/auth/login`)
    };

    return async (ctx) => {

        const request = makeAuthorizationRequest(ctx.query)

        try {
            switch (request.responseType) {
                case 'code':
                    await handleCodeResponseType(ctx, request);
                    break
                default:
                    await handleUnsupportedResponseType(request);
            }
        } catch (err) {
            const error =
                err instanceof OAuth2ServerError ? err : new ServerError();
            ctx.status = error.statusCode
            ctx.body = {
                error: error.error,
                error_description: error.errorDescription
            }
        }
    }
}