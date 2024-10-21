import {Handlers} from "../handlers/index.js";
import Router from "koa-router";
import {WithAuthContext} from "../middlewares/koa-auth.js";
import {Keys} from "../config/index.js";
import {Tasks} from "../tasks/index.js";

export type RouterOptions = {
    tasks: Tasks
    handlers: Handlers
    keys: Keys
}

export type AuthRouter = Router<unknown, WithAuthContext>