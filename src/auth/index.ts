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

    router.get('/authorize', makeHandleAuthorization({
        queries,
        handlers
    }))

    router.get('/pwd', makeHandlePwdGet({
        queries,
        handlers
    }))

    router.post('/pwd', makeHandlePwdPost({
        queries,
        handlers
    }))

    router.get('/consent', makeHandleConsentGet({
        queries,
        handlers
    }))

    router.post('/consent', makeHandleConsentPost({
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