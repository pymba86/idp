import {IRouterParamContext} from "koa-router";
import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Middleware} from "koa";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";
import {ParsedUrlQuery} from "querystring";
import {parseParam} from "./query.js";
import {generateStandardId} from "@astoniq/idp-shared";

interface ActivateRequest {
    code?: string;
}

export const makeHandleActivateGet = <StateT, ContextT extends IRouterParamContext>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, WithInertiaContext<ContextT>> => {

    const {
        queries: {
            userRegistrations: {
                findUserRegistrationById,
                deleteUserRegistrationById
            },
            users: {
                insertUser,
                findUserByEmail
            }
        }
    } = options

    const makeAuthorizationRequest = (query: ParsedUrlQuery): ActivateRequest => {
        return {
            code: parseParam(query.code),
        }
    }

    return async (ctx) => {

        const request = makeAuthorizationRequest(ctx.query)

        if (!request.code) {
            return ctx.inertia.render('Error')
        }

        const userRegistration = await findUserRegistrationById(request.code);

        if (!userRegistration) {
            return ctx.inertia.render('Error')
        }

        const now = Date.now()

        if (userRegistration.expiresAt < now) {
            return ctx.inertia.render('Error')
        }

        const user = await findUserByEmail(userRegistration.email);

        if (user) {
            return ctx.inertia.render('RegisterActivationResult', {
                error: 'email already exists'
            })
        }

        await insertUser({
            id: generateStandardId(),
            email: userRegistration.email,
            password: userRegistration.password
        })

        await deleteUserRegistrationById(request.code)

        return ctx.inertia.render('RegisterActivationResult')
    }
}