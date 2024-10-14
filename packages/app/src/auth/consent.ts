import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Context, Middleware} from "koa";
import {IRouterParamContext} from "koa-router";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";
import {generateStandardId} from "@astoniq/idp-shared";
import {Code, SessionStoreData} from "@astoniq/idp-schemas";

export const makeHandleConsentGet = <StateT, ContextT extends IRouterParamContext>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, WithInertiaContext<ContextT>> => {

    const {
        handlers: {
            getSession
        },
        queries: {
            clients: {
                findClientById
            },
            userConsents: {
                findConsentByUserIdAndClientId,
            }
        }
    } = options

    return async (ctx) => {

        const session = await getSession(ctx);

        const {authContext} = session.data;


        if (!authContext) {
            ctx.redirect('/auth/bad')
            return;
        }

        if (!authContext.authCompleted) {
            ctx.redirect('/auth/bad')
            return;
        }

        if (!authContext.clientId) {
            ctx.redirect('/auth/bad')
            return;
        }

        if (!authContext.userId) {
            ctx.redirect('/auth/bad')
            return;
        }

        const client = await findClientById(authContext.clientId)

        if (!client) {
            ctx.redirect('/auth/bad')
            return;
        }

        if (client.consent) {

            const consent = await findConsentByUserIdAndClientId(
                authContext.userId,
                authContext.clientId
            )

            if (!consent) {
                ctx.inertia.render('consent')
                return
            }
        }

        if (!authContext.responseMode) {
            ctx.redirect('/auth/bad');
            return
        }

        try {
            const code = await createAuthCode(session.data, options.queries)

            if (!code) {
                ctx.redirect('/auth/bad');
                return
            }

            delete session.data.authContext;

            await session.commit()

            if (authContext.redirectUri) {
                handleResponseMode(ctx, authContext.responseMode, code)
                return;
            }

        } catch (error) {
            ctx.redirect('/auth/bad')
        }

    }
}

const createAuthCode = async (sessionData: Partial<SessionStoreData>, queries: Queries) => {

    const id = generateStandardId()
    const {authContext, userSessionId} = sessionData

    if (!authContext) {
        return
    }

    if (!authContext.userId) {
       throw new Error('')
    }

    if (!authContext.redirectUri) {
        throw new Error('')
    }

    if (!authContext.scope) {
        throw new Error('')
    }

    if (!authContext.clientId) {
        throw new Error('')
    }

    if (!userSessionId) {
        throw new Error('')
    }

    const now = Date.now();
    const expiresAt = now + 60 * 5 * 1000; // 5 min

    return queries.codes.insertAuthorizationCode({
        id: id,
        userId: authContext.userId,
        redirectUri: authContext.redirectUri,
        scope: authContext.scope,
        clientId: authContext.clientId,
        expiresAt: expiresAt,
        userSessionId: userSessionId
    })
}

const makeRedirectUri = (uri: string,
                         code: string): string => {
    const url = new URL(uri);
    url.searchParams.set('code', code);

    return url.toString();
};

const handleResponseMode = (ctx: Context,
                            responseMode: string,
                            code: Code) => {
    switch (responseMode) {
        case 'query':
            return ctx.redirect(makeRedirectUri(code.redirectUri, code.id));
        case 'fragment':
            return ctx.redirect(makeRedirectUri(code.redirectUri, code.id));
    }
};

export const makeHandleConsentPost = <StateT, ContextT>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, ContextT> => {

    const {
        handlers: {
            getSession
        },
        queries: {
            userConsents: {
                insertUserConsent
            }
        }
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

        if (!authContext.responseMode) {
            ctx.redirect('/auth/bad');
            return
        }

        if (!authContext.clientId) {
            ctx.redirect('/auth/bad')
            return;
        }

        if (!authContext.userId) {
            ctx.redirect('/auth/bad')
            return;
        }

        try {

            await insertUserConsent({
                id: generateStandardId(),
                userId: authContext.userId,
                clientId: authContext.clientId
            })

            const code = await createAuthCode(session.data, options.queries)

            if (!code) {
                ctx.redirect('/auth/bad');
                return
            }

            delete session.data.authContext;

            await session.commit()

            if (authContext.redirectUri) {
                handleResponseMode(ctx, authContext.responseMode, code)
                return;
            }

        } catch (error) {
            ctx.redirect('/auth/bad')
        }
    }
}