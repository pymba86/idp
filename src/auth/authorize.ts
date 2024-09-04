import {Middleware} from "koa";
import {ParsedUrlQuery} from "querystring";
import {Queries} from "../queries/index.js";
import {Client, ClientMetadata} from "../schemas/index.js";
import {InvalidRequest, InvalidScope, OAuth2ServerError, ServerError} from "./errors.js";

export const makeHandleAuthorization = (options: {
    queries: Queries
}): Middleware => {

    const {
        queries: {
            clients: {
                findClientById
            }
        }
    } = options


    interface AuthorizationRequest {
        responseType?: string;
        responseMode?: string;
        clientId?: string;
        redirectUri?: string;
        scope?: string;
        state?: string;
    }

    const parseQueryParam = (param: string | string[] | undefined) => {
        return typeof param === 'string' ? param : undefined
    }

    const makeAuthorizationRequest = (query: ParsedUrlQuery): AuthorizationRequest => {
        return {
            responseType: parseQueryParam(query.response_type),
            responseMode: parseQueryParam(query.response_mode),
            clientId: parseQueryParam(query.client_id),
            redirectUri: parseQueryParam(query.redirect_uri),
            scope: parseQueryParam(query.scope)
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
        }

        if (req.scope) {
            validateScope(req.scope);
        } else {
            throw new InvalidRequest("The 'scope' parameter is missing.");
        }

        // getUserSessionBySessionId
        // getUserById
        // bumpUserSession
        // save auth context
        // redirect to consent
    };

    return (ctx) => {

        const request = makeAuthorizationRequest(ctx.query)

        try {
            switch (request.responseType) {
                case 'code':
                    return handleCodeResponseType(request);
                default:
                    return handleUnsupportedResponseType(request);
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