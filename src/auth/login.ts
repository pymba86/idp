import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Middleware} from "koa";
import {nanoid} from "nanoid";

export const makeHandleLoginGet = <StateT, ContextT>(options: {
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

        ctx.body = render('login')
        ctx.status = 200
    }
}

export const makeHandleLoginPost = <StateT, ContextT>(options: {
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

        authContext.authCompleted = true
        authContext.userId = '1'

        const id = nanoid()

        session.data.authContext = authContext;
        session.data.userSessionId = id;

        await session.commit()

        ctx.redirect(`/auth/consent`)
    }
}