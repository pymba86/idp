import {Handlers} from "../handlers/index.js";
import Router from "koa-router";
import {WithAuthContext} from "../middlewares/koa-auth.js";
import {Tasks} from "../tasks/index.js";
import {Libraries} from "../libraries/index.js";
import {Queries} from "../queries/index.js";

export type RouterOptions = {
    tasks: Tasks
    handlers: Handlers
    libraries: Libraries
    queries: Queries
}

export type AuthRouter = Router<unknown, WithAuthContext>