import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Middleware} from "koa";
import {IRouterParamContext} from "koa-router";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";
import {InvalidRequest} from "./errors.js";
import {generateStandardId} from "@astoniq/idp-shared";
import {hashValue} from "../utils/hash.js";

export const makeHandleRegisterGet = <StateT, ContextT extends IRouterParamContext>(options: {
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

        ctx.inertia.render('Register')
    }
}

export const makeHandleRegisterPost = <StateT, ContextT extends IRouterParamContext>(options: {
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
            userRegistrations: {
                insertUserRegistration
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
            ctx.inertia.render('Register', {error: 'email required'})
            return;
        }

        if (email.length === 0) {
            ctx.inertia.render('Register', {error: 'email is not empty', email})
            return;
        }

        if (typeof password !== 'string') {
            ctx.inertia.render('Register', {error: 'password required', email})
            return;
        }

        if (password.length === 0) {
            ctx.inertia.render('Register', {error: 'password is not empty', email})
            return;
        }

        const user = await findUserByEmail(email);

        if (user) {
            ctx.inertia.render('Register', {error: 'email already exists', email})
            return;
        }

        const id = generateStandardId()

        const now = Date.now()

        const expiresAt = now + 60 * 15 * 1000 // 15 minute

        const hashPassword = await hashValue(password)

        await insertUserRegistration({
            id,
            password: hashPassword,
            email,
            expiresAt
        })

        ctx.inertia.render('RegisterActivation')
    }
}