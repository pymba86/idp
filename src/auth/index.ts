import Koa from "koa";
import {RouterOptions} from "./types.js";
import Router from "koa-router";
import {makeHandleAuthorization} from "./authorize.js";
import {makeHandlePwdGet, makeHandlePwdPost} from "./pwd.js";
import {makeHandleConsentGet, makeHandleConsentPost} from "./consent.js";


const createRouters = (options: RouterOptions) => {

    const {
        queries,
        handlers
    } = options

    const router = new Router();

    router.get('/', makeHandleAuthorization({
        queries,
        handlers
    }))

    router.get('/:id/pwd', makeHandlePwdGet({
        queries,
        handlers
    }))

    router.post('/:id/pwd', makeHandlePwdPost({
        queries,
        handlers
    }))

    router.get('/:id/consent', makeHandleConsentGet({
        queries,
        handlers
    }))

    router.post('/:id/consent', makeHandleConsentPost({
        queries,
        handlers,
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