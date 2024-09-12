import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import Router from "koa-router";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";

export type RouterOptions = {
    queries: Queries
    handlers: Handlers
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