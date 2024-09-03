import Koa, {Context} from "koa";
import {RouterOptions} from "../routes/types.js";
import Router from "koa-router";
import {ParsedUrlQuery} from "querystring";


const createRouters = (options: RouterOptions) => {

    const {
        eta
    } = options

    const router = new Router();

    interface AuthorizationRequest {
        responseType?: string;
        responseMode?: string;
        clientId?: string;
        redirectUri?: string;
        scope?: string;
        state?: string;
    }

    const makeAuthorizationRequest = (query: ParsedUrlQuery): AuthorizationRequest => {
        return {
            responseType: typeof query.response_type === 'string' ? query.response_type : undefined,
            responseMode: typeof query.response_mode === 'string' ? query.response_mode : undefined,
            clientId: typeof query.client_id === 'string' ? query.client_id : undefined,
            redirectUri: typeof query.redirect_uri === 'string' ? query.redirect_uri : undefined,
            scope: typeof query.scope === 'string' ? query.scope : undefined,
            state: typeof query.state === 'string' ? query.state : undefined,
        }
    }

    interface RedirectToClientOptions {
        code: string;
        description: string;
        responseMode: string;
        redirectUri: string;
        state: string;
    }

    const redirectToClientWithError = (ctx: Context, options: RedirectToClientOptions) => {

    }

    router.get('/authorize', (ctx) => {

        const authorizationRequest = makeAuthorizationRequest(ctx.query)

        try {

        } catch (error) {

        }
    })

    return [router]
}

export function initAuthApis(options: RouterOptions): Koa {

    const apisApp = new Koa()

    for (const router of createRouters(options)) {
        apisApp.use(router.routes()).use(router.allowedMethods())
    }

    return apisApp;
}