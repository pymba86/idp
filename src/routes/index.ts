import Koa from "koa";
import Router from "koa-router";
import {RouterOptions} from "./types.js";

const createRouters = (options: RouterOptions) => {

    const {
        handlers: {
            render
        }
    } = options

    const router = new Router();

    router.get('/', (ctx, next) => {
        ctx.body = render('index', {name: 'idp'})
        ctx.status = 200
        return next()
    })

    return [router]
}

export function initApis(options: RouterOptions): Koa {

    const apisApp = new Koa()

    for (const router of createRouters(options)) {
        apisApp.use(router.routes()).use(router.allowedMethods())
    }

    return apisApp;
}