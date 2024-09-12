import {logger} from "../utils/logger.js";
import {Middleware} from "koa";
import {OAuth2ServerError, ServerError} from "./errors.js";

export type RequestErrorBody = {
    error: string;
    error_description: string;
}

export default function errorHandler<StateT, ContextT, BodyT>(): Middleware<
    StateT, ContextT, BodyT | RequestErrorBody> {
    return async (ctx, next) => {
        try {
            await next()
        } catch (err: unknown) {

            const error =
                err instanceof OAuth2ServerError ? err : new ServerError();

            ctx.status = error.statusCode
            ctx.body = {
                error: error.error,
                error_description: error.errorDescription
            }

            if (error instanceof ServerError) {
                logger.error(error);
            }
        }
    }
}