import {IRouterParamContext} from "koa-router";
import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Middleware} from "koa";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";
import {generateStandardId} from "@astoniq/idp-shared";

export const makeHandleVerifyGet = <StateT, ContextT extends IRouterParamContext>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, WithInertiaContext<ContextT>> => {

    const {
        queries: {
            userSessions: {
                insertUserSession
            }
        },
        handlers: {
            getSession
        },
    } = options

    return async (ctx) => {

        const session = await getSession(ctx);

        const {authContext, userSessionId} = session.data;

        if (!authContext) {
            return ctx.redirect('/auth/bad')
        }

        if (!authContext.authCompleted) {
            return ctx.redirect('/auth/bad')
        }

        if (!authContext.userId) {
            return ctx.inertia.render('Verify', {
                userInfo: authContext.userInfo
            })
        }

        if (!userSessionId) {

            const id = generateStandardId()

            // Добавление новой сессии пользователя
            await insertUserSession(id, authContext.userId, session.id);

            session.data.userSessionId = id
        }

        // OTP проверка

        session.data.authContext = {
            ...authContext,
            verifyCompleted: true,
        };

        await session.commit()

        return ctx.redirect(`/auth/consent`);
    }
}