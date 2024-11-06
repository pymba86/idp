import Router from "koa-router";
import {RouterOptions} from "./types.js";
import {ParsedUrlQuery} from "querystring";
import {parseParam} from "../auth/query.js";
import {buildProviderMetadata} from "../providers/index.js";
import {Provider, ProviderAction, UserInfo} from "@astoniq/idp-schemas";
import {Session} from "../handlers/session.js";

interface CallbackRequest {
    code?: string;
    state?: string;
}

interface ProviderActionOptions {
    provider: Provider,
    session: Session,
    redirectUri?: string;
    userInfo: UserInfo
}

export default function callbackRoutes<T extends Router>(router: T, options: RouterOptions) {

    const {
        queries: {
            providers: {
                findProviderById
            },
            userProviders: {
                findUserProviderByIdentityId
            }
        },
        handlers: {
            getSession,
            baseUrl
        }
    } = options

    const makeCallbackRequest = (query: ParsedUrlQuery): CallbackRequest => {
        return {
            code: parseParam(query.code),
            state: parseParam(query.state)
        }
    }

    // Процесс входа через поставщика
    const handleAuthAction = async (options: ProviderActionOptions) => {

        const {
            userInfo,
            session,
            provider
        } = options;

        const {
            authContext
        } = session.data

        if (!authContext) {
            return '/bad'
        }

        const userProvider = await findUserProviderByIdentityId(provider.id, userInfo.id);

        if (userProvider) {
            // Если поставщик уже привязан к пользователю
            // продолжаем процесс входа с привязкой к пользователю
            authContext.userId = userProvider.userId;
        }

        session.data.authContext = {
            ...authContext,
            authCompleted: true,
            userInfo: userInfo
        }

        return '/auth/verify'
    }

    // Привязка способа входа к пользователю
    const handleLinkAction = async (options: ProviderActionOptions) => {

        const {
            redirectUri
        } = options

        if (redirectUri) {
            return redirectUri
        }

        return '/'
    }

    // Не правильный запрос
    const handleBad = async (options: ProviderActionOptions) => {
        const {
            redirectUri
        } = options

        if (redirectUri) {
            return redirectUri
        }

        return '/'
    }

    const handleByAction = async (
        options: ProviderActionOptions,
        action?: ProviderAction
    ): Promise<string> => {
        switch (action) {
            case ProviderAction.Auth:
                return handleAuthAction(options)
            case ProviderAction.Link:
                return handleLinkAction(options)
            default:
                return handleBad(options)
        }
    }

    router.get('/callback',
        async (ctx) => {

            const request = makeCallbackRequest(ctx.query)

            const session = await getSession(ctx)

            const {
                providerContext
            } = session.data;

            if (!providerContext) {
                return ctx.redirect('/bad')
            }

            const {
                providerId,
                state,
                redirectUri,
                action
            } = providerContext


            if (!providerId) {
                return ctx.redirect('/bad')
            }

            if (!state) {
                return ctx.redirect('/bad')
            }

            if (state != request.state) {
                return ctx.redirect('/bad')
            }

            const provider = await findProviderById(providerId)

            if (!provider) {
                return ctx.redirect('/bad')
            }

            const providerMetadata = buildProviderMetadata(provider.type);

            // Получаем информацию по пользователю из поставщика

            const userInfo = await providerMetadata.getUserInfo(
                {
                    config: provider.config,
                    baseUrl: baseUrl,
                    data: request
                },
                async () => providerContext)

            // Формирует адрес для редиректа

            const url = await handleByAction({
                userInfo,
                provider,
                redirectUri,
                session
            }, action)

            // Очищаем контекст
            delete session.data.providerContext;

            await session.commit();

            return ctx.redirect(url)
        });
}