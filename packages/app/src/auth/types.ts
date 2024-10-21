import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import Router from "koa-router";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";
import {Libraries} from "../libraries/index.js";
import {Tasks} from "../tasks/index.js";
import {Scheduler} from "../scheduler/index.js";

export type RouterOptions = {
    tasks: Tasks
    scheduler: Scheduler
    queries: Queries
    handlers: Handlers
    libraries: Libraries
}

export type AuthRouter = Router<unknown, WithInertiaContext>


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