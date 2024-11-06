import {IRouterParamContext} from "koa-router";
import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Middleware} from "koa";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";
import {buildProviderMetadata} from "../providers/index.js";
import {generateStandardId} from "@astoniq/idp-shared";
import {ProviderAction} from "@astoniq/idp-schemas";

export const makeHandleProviderGet = <StateT, ContextT extends IRouterParamContext>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, WithInertiaContext<ContextT>> => {

    const {
        queries: {
            providers: {
                findProviderLinkById
            }
        },
        handlers: {
            getSession,
            baseUrl
        },
    } = options

    return async (ctx) => {

        const {
            id
        } = ctx.params

        const session = await getSession(ctx);

        if (!session.data.authContext) {
            return ctx.inertia.render('Error', {error: 'auth context not found'})
        }

        if (typeof id !== 'string') {
            return ctx.inertia.render('Error', {error: 'provider id required'})
        }

        const provider = await findProviderLinkById(id);

        if (!provider) {
            return ctx.inertia.render('Error', {error: 'provider link not found'})
        }

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
}