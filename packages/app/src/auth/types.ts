import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import Router, {IRouterParamContext} from "koa-router";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";
import {Libraries} from "../libraries/index.js";
import {Tasks} from "../tasks/index.js";
import {Scheduler} from "../scheduler/index.js";
import {WithSignInExperienceContext} from "../middlewares/koa-sign-in-experience.js";

export type RouterOptions = {
    tasks: Tasks
    scheduler: Scheduler
    queries: Queries
    handlers: Handlers
    libraries: Libraries
}

export type AuthRouterContext<Context extends IRouterParamContext = IRouterParamContext> =
    WithInertiaContext<Context>
    & WithSignInExperienceContext<Context>

export type AuthRouter = Router<unknown, AuthRouterContext>


export interface AuthorizationRequest {
    responseType?: string;
    responseMode?: string;
    clientId?: string;
    redirectUri?: string;
    scope?: string;
}

export interface TokenRequest {
    grantType?: string;
    code?: string;
    redirectUri?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    scope?: string;
}