import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Middleware} from "koa";
import {nanoid} from "nanoid";

export const makeHandleConsentGet = <StateT, ContextT>(options: {
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
                authContext,
            }
        } = await getInteraction(ctx)


        if (!authContext) {
            ctx.redirect('/auth/bad')
            return;
        }

        if (!authContext.authCompleted) {
            ctx.redirect('/auth/bad')
            return;
        }

        ctx.body = render('consent')
        ctx.status = 200

    }
}

export const makeHandleConsentPost = <StateT, ContextT>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, ContextT> => {

    const {
        handlers: {
            getInteraction
        },
    } = options

    return async (ctx) => {

        const interaction = await getInteraction(ctx);

        const {authContext} = interaction.data;

        if (!authContext) {
            return
        }

        if (!authContext.authCompleted) {
            ctx.redirect('/auth/bad');
            return
        }

        const code = nanoid()

        await interaction.destroy()

        if (authContext.redirectUri) {
            ctx.redirect(authContext.redirectUri + '?code=' + code)
            return;
        }

        ctx.redirect('/auth/bad')
    }
}