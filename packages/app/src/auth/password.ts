import {IRouterParamContext} from "koa-router";
import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Middleware} from "koa";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";
import {verifyValue} from "../utils/hash.js";

export const makeHandlePasswordGet = <StateT, ContextT extends IRouterParamContext>(options: {
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
                authContext
            }
        } = await getSession(ctx)


        if (!authContext) {
            return ctx.redirect('/auth/bad')
        }

        if (!authContext.email) {
            return ctx.redirect('/auth/bad')
        }

        return ctx.inertia.render('Password', {email: authContext.email})
    }
}

export const makeHandlePasswordPost = <StateT, ContextT extends IRouterParamContext>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, WithInertiaContext<ContextT>> => {

    const {
        handlers: {
            getSession,
        },
        queries: {
            users: {
                findUserByEmail
            },
        }
    } = options

    return async (ctx) => {

        const session = await getSession(ctx);

        const {authContext} = session.data;

        if (!authContext) {
            return ctx.redirect('/auth/bad')
        }

        if (!authContext.email) {
            return ctx.redirect('/auth/bad')
        }

        const {
            password,
        } = ctx.request.body

        if (typeof password !== 'string') {
            ctx.inertia.render('Password', {error: 'password required'})
            return;
        }

        if (password.length === 0) {
            ctx.inertia.render('Password', {error: 'password is not empty'})
            return;
        }

        const user = await findUserByEmail(authContext.email);

        if (!user) {
            return ctx.inertia.render('Password', {error: 'user not found'})
        }

        const verify = await verifyValue(password, user.password)

        if (!verify) {
            return ctx.inertia.render('Password', {error: 'password is incorrect'})
        }

        session.data.authContext = {
            ...authContext,
            authCompleted: true,
            userId: user.id
        };

        await session.commit()

        return ctx.redirect(`/auth/verify`)
    }
}