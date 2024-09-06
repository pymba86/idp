import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Middleware} from "koa";
import {nanoid} from "nanoid";
import {IRouterParamContext} from "koa-router";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";

export const makeHandleConsentGet = <StateT, ContextT extends IRouterParamContext>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, WithInertiaContext<ContextT>> => {

    const {
        handlers: {
            getSession
        },
    } = options

    return async (ctx) => {

        const {
            data: {
                authContext,
            }
        } = await getSession(ctx)


        if (!authContext) {
            ctx.redirect('/auth/bad')
            return;
        }

        if (!authContext.authCompleted) {
            ctx.redirect('/auth/bad')
            return;
        }

        ctx.inertia.render('consent')

    }
}

export const makeHandleConsentPost = <StateT, ContextT>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, ContextT> => {

    const {
        handlers: {
            getSession
        },
    } = options

    return async (ctx) => {

        const session = await getSession(ctx);

        const {authContext} = session.data;

        if (!authContext) {
            return
        }

        if (!authContext.authCompleted) {
            ctx.redirect('/auth/bad');
            return
        }

        const code = nanoid()

        delete session.data.authContext;

        await session.commit()

        if (authContext.redirectUri) {
            ctx.redirect(authContext.redirectUri + '?code=' + code)
            return;
        }

        ctx.redirect('/auth/bad')
    }
}