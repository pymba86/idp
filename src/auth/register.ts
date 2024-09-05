import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Middleware} from "koa";

export const makeHandleRegisterGet = <StateT, ContextT>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, ContextT> => {

    const {
        handlers: {
            getSession,
            render
        },
    } = options

    return async (ctx) => {

        const {
            data: {
                authContext
            }
        } = await getSession(ctx)


        if (!authContext) {
            ctx.redirect('/auth/bad')
            return;
        }

        ctx.body = render('register')
        ctx.status = 200
    }
}