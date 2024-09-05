import Koa from "koa";
import Router from "koa-router";
import {RouterOptions} from "./types.js";
import {RequestError} from "../errors/index.js";

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

    router.get('/test', (_context) => {

        throw new RequestError({
            code: 'required_field_missing',
            status: 400
        });

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