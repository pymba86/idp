import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Middleware} from "koa";
import {IRouterParamContext} from "koa-router";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";
import {InvalidRequest} from "./errors.js";
import {emailRegEx, generateStandardId} from "@astoniq/idp-shared";
import {verifyValue} from "../utils/hash.js";

export const makeHandleLoginGet = <StateT, ContextT extends IRouterParamContext>(options: {
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
            ctx.redirect('/auth/bad')
            return;
        }

        ctx.inertia.render('Login')
    }
}

export const makeHandleLoginPost = <StateT, ContextT extends IRouterParamContext>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, WithInertiaContext<ContextT>> => {

    const {
        handlers: {
            getSession
        },
        queries: {
            users: {
                findUserByEmail
            },
            userSessions: {
                insertUserSession
            }
        }
    } = options

    return async (ctx) => {

        const session = await getSession(ctx);

        const {authContext} = session.data;

        if (!authContext) {
            throw new InvalidRequest("auth context not found");
        }

        const {
            email,
            password
        } = ctx.request.body

        if (typeof email !== 'string') {
            ctx.inertia.render('Login', {error: 'email required'})
            return;
        }

        if (email.length === 0) {
            ctx.inertia.render('Login', {error: 'email is not empty', email})
            return;
        }

        if (typeof password !== 'string') {
            ctx.inertia.render('Login', {error: 'password required', email})
            return;
        }

        if (password.length === 0) {
            ctx.inertia.render('Login', {error: 'password is not empty', email})
            return;
        }

        if (!emailRegEx.test(email)) {
            return ctx.inertia.render('Login', {error: 'email bad', email})
        }

        const user = await findUserByEmail(email);

        if (!user) {
            ctx.inertia.render('Login', {error: 'user not found', email})
            return;
        }

        const verify = await verifyValue(password, user.password)

        if (!verify) {
            ctx.inertia.render('Login', {error: 'password is incorrect', email})
            return;
        }

        const id = generateStandardId()

        const userSession = await insertUserSession(id, user.id, session.id)

        authContext.authCompleted = true
        authContext.userId = user.id

        session.data.authContext = authContext;
        session.data.userSessionId = userSession.id;

        await session.commit()

        ctx.redirect(`/auth/consent`)
    }
}