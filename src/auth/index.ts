import Koa from "koa";
import {RouterOptions} from "./types.js";
import Router from "koa-router";
import {makeHandleAuthorization} from "./authorize.js";


const createRouters = (options: RouterOptions) => {

    const {
        queries
    } = options

    const router = new Router();

    router.get('/authorize', makeHandleAuthorization({
        queries
    }))

    return [router]
}

export function initAuthApis(options: RouterOptions): Koa {

    const apisApp = new Koa()

    for (const router of createRouters(options)) {
        apisApp.use(router.routes()).use(router.allowedMethods())
    }

    return apisApp;
}