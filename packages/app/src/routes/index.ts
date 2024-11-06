import Koa from "koa";
import Router from "koa-router";
import {AuthRouter, RouterOptions} from "./types.js";
import koaAuth from "../middlewares/koa-auth.js";
import {exportJWK} from "../utils/jwks.js";
import statusRoutes from "./status.js";
import callbackRoutes from "./callback.js";

const createRouters = (options: RouterOptions) => {

    const {
        libraries: {
            jwt
        }
    } = options

    const router = new Router();

    statusRoutes(router)
    callbackRoutes(router, options)

    router.get('/jwks', async (ctx) => {

        const jwks = await jwt.getKeys()

        ctx.body = {
            keys: jwks.map(key => exportJWK(key))
        }
    })

    const authRouter: AuthRouter = new Router()

    authRouter.use(koaAuth(jwt))

    authRouter.get('/userinfo', (ctx) => {
        ctx.body = ctx.auth
    })

    return [router, authRouter]
}

export function initApis(options: RouterOptions): Koa {

    const apisApp = new Koa()

    for (const router of createRouters(options)) {
        apisApp.use(router.routes()).use(router.allowedMethods())
    }

    return apisApp;
}