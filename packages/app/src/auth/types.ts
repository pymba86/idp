import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import Router from "koa-router";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";

export type RouterOptions = {
    queries: Queries
    handlers: Handlers
}

export type AuthRouter = Router<unknown, WithInertiaContext>