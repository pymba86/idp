import Koa from "koa";
import Router from "koa-router";
import {AuthRouter, RouterOptions} from "./types.js";
import koaAuth from "../middlewares/koa-auth.js";

const createRouters = (options: RouterOptions) => {

    const {
        handlers: {
            renderTemplate
        },
        libraries: {
            jwt
        }
    } = options

    const router = new Router();

    router.get('/', (ctx, next) => {
        ctx.body = renderTemplate('index', {name: 'idp'})
        ctx.status = 200
        return next()
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