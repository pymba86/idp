import {IRouterParamContext} from "koa-router";
import {ConfigKey, SignInExperienceConfig} from "@astoniq/idp-schemas";
import {Middleware} from "koa";
import {Queries} from "../queries/index.js";
import {getConfigByKey} from "../queries/config.js";

export type WithSignInExperienceContext<Context extends IRouterParamContext = IRouterParamContext> = Context & {
    signInExperience: SignInExperienceConfig
}

export default function koaSignInExperience<StateT, ContextT extends IRouterParamContext>(
    {pool}: Queries
): Middleware<StateT, WithSignInExperienceContext<ContextT>> {

    return async (ctx, next) => {

        ctx.signInExperience = await getConfigByKey(pool, ConfigKey.SignInExperience)

        return next();
    }
}