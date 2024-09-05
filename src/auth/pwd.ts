import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Middleware} from "koa";
import {nanoid} from "nanoid";

export const makeHandlePwdGet = <StateT, ContextT>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, ContextT> => {

    const {
        handlers: {
            getInteraction,
            render
        },
    } = options

    return async (ctx) => {

        const {
            data: {
                authContext
            }
        } = await getInteraction(ctx)


        if (!authContext) {
            ctx.redirect('/auth/bad')
            return;
        }

        ctx.body = render('pwd')
        ctx.status = 200
    }
}

export const makeHandlePwdPost = <StateT, ContextT>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, ContextT> => {

    const {
        handlers: {
            getInteraction,
            getSession
        },
    } = options

    return async (ctx) => {

        const session = await getSession(ctx);
        const interaction = await getInteraction(ctx);

        const {authContext} = interaction.data;

        if (!authContext) {
            return
        }

        authContext.authCompleted = true
        authContext.userId = '1'

        const id = nanoid()

        interaction.data.authContext = authContext;
        session.data.userSessionId = id;

        await session.commit()
        await interaction.commit()

        ctx.redirect(`/auth/${interaction.id}/consent`)
    }
}