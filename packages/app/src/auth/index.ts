import Koa from "koa";
import {AuthRouter, RouterOptions} from "./types.js";
import Router from "koa-router";
import {makeHandleAuthorization} from "./authorize.js";
import {makeHandleLoginPost, makeHandleLoginGet} from "./login.js";
import {makeHandleConsentGet, makeHandleConsentPost} from "./consent.js";
import {makeHandleRegisterGet, makeHandleRegisterPost} from "./register.js";
import koaInertia from "../middlewares/koa-inertia.js";
import koaBody from "koa-body";
import {makeHandleClientAuthentication} from "./client.js";
import {makeHandleTokenPost} from "./token.js";
import errorHandler from "./error-handler.js";
import {makeHandleActivateGet} from "./activate.js";


const createRouters = (options: RouterOptions) => {

    const {
        queries,
        tasks,
        scheduler,
        handlers,
        libraries
    } = options

    const clientAuthentication = makeHandleClientAuthentication({
        queries
    })

    const router: AuthRouter = new Router();

    router.use(koaBody())
    router.use(errorHandler())

    router.use(
        koaInertia({
            html: page => handlers.render('index', {page: JSON.stringify(page)})
        }))

    router.get('/', makeHandleAuthorization({
        queries,
        handlers,
        libraries
    }))

    router.get('/login', makeHandleLoginGet({
        queries,
        handlers
    }))

    router.get('/register', makeHandleRegisterGet({
        queries,
        handlers
    }))

    router.post('/register', makeHandleRegisterPost({
        queries,
        tasks,
        scheduler,
        handlers
    }))

    router.get('/activate', makeHandleActivateGet({
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

    router.post('/token', makeHandleTokenPost({
        queries,
        handlers,
        libraries,
        clientAuthentication
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