import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Middleware} from "koa";
import {IRouterParamContext} from "koa-router";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";
import {emailRegEx, generateStandardId} from "@astoniq/idp-shared";
import {buildProviderMetadata} from "../providers/index.js";
import {ProviderAction} from "@astoniq/idp-schemas";

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
            return ctx.redirect('/auth/bad')
        }

        return ctx.inertia.render('Login')
    }
}

export const makeHandleLoginPost = <StateT, ContextT extends IRouterParamContext>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, WithInertiaContext<ContextT>> => {

    const {
        handlers: {
            getSession,
            baseUrl
        },
        queries: {
            users: {
                findUserByEmail
            },
            providers: {
                findProvidersSso
            }
        }
    } = options

    return async (ctx) => {

        const session = await getSession(ctx);

        const {authContext} = session.data;

        if (!authContext) {
            return ctx.redirect('/auth/bad')
        }

        const {
            email,
        } = ctx.request.body

        if (typeof email !== 'string') {
            return ctx.inertia.render('Login', {error: 'email required'})
        }

        if (email.length === 0) {
            return ctx.inertia.render('Login', {error: 'email is not empty', email})
        }

        if (!emailRegEx.test(email)) {
            return ctx.inertia.render('Login', {error: 'email bad', email})
        }

        const domain = email.split('@')[1];

        if (!domain) {
            return ctx.inertia.render('Login', {error: 'domain bad', email})
        }

        // Поиск домена в sso поставщиках
        const providers = await findProvidersSso()

        const provider = providers.find(
            item => item.domains.includes(domain))

        if (provider) {

            const providerMetadata = buildProviderMetadata(provider.type);

            const state = generateStandardId()

            const redirectUri = await providerMetadata.getAuthorizationUri({
                action: ProviderAction.Auth,
                config: provider.config,
                providerId: provider.id,
                state,
                baseUrl,
            }, async (context) => {
                session.data.providerContext = context
            })

            await session.commit();

            return ctx.redirect(redirectUri)
        }

        // Поиск email в локальной базе
        const user = await findUserByEmail(email);

        if (!user) {
            return ctx.inertia.render('Login', {error: 'user not found', email})
        }

        session.data.authContext = {
            ...authContext,
            email: email
        };

        await session.commit()

        return ctx.redirect(`/auth/password`)
    }
}