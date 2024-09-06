import Koa from "koa";
import {AuthRouter, RouterOptions} from "./types.js";
import Router from "koa-router";
import {makeHandleAuthorization} from "./authorize.js";
import {makeHandleLoginPost, makeHandleLoginGet} from "./login.js";
import {makeHandleConsentGet, makeHandleConsentPost} from "./consent.js";
import {makeHandleRegisterGet} from "./register.js";
import koaInertia from "../middlewares/koa-inertia.js";
import koaBody from "koa-body";


const createRouters = (options: RouterOptions) => {

    const {
        queries,
        handlers
    } = options

    const router: AuthRouter = new Router();

    router.use(koaBody())

    router.use(
        koaInertia({
            html: page => handlers.render('index', {page: JSON.stringify(page)})
        }))

    router.get('/', makeHandleAuthorization({
        queries,
        handlers
    }))

    router.get('/login', makeHandleLoginGet({
        queries,
        handlers
    }))

    router.get('/register', makeHandleRegisterGet({
        queries,
        handlers
    }))

    router.post('/login', makeHandleLoginPost({
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