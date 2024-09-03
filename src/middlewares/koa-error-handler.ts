import {logger} from "../utils/logger.js";
import {HttpError, Middleware} from "koa";
import {RequestError} from "../errors/request-error.js";
import {ZodError} from "zod";
import {dictionaries, PhraseCode} from "../phrases/index.js";
import {conditional} from "../utils/conditional.js";

const formatZodError = ({issues}: ZodError): string[] =>
    issues.map((issue) => {
        const base = `Error in key path "${issue.path.map(String).join('.')}": (${issue.code}) `;

        if (issue.code === 'invalid_type') {
            return base + `Expected ${issue.expected} but received ${issue.received}.`;
        }

        return base + issue.message;
    });

export type RequestErrorBody<T = unknown> = {
    message: string
    data: T
    code: PhraseCode;
    details?: string
}

export default function koaErrorHandler<StateT, ContextT, BodyT>(): Middleware<
    StateT, ContextT, BodyT | RequestErrorBody | { message: string }> {
    return async (ctx, next) => {
        try {
            await next()
        } catch (error: unknown) {

            if (error instanceof RequestError) {

                const dictionary = dictionaries['en'];

                let message = dictionary[error.code]

                if (error.slots) {
                    const slots = Object.keys(error.slots)
                    for (const slot of slots) {
                      message =  message.replace(
                          `{{${slot}}}`, String(error.slots[slot]))
                    }
                }

                const createDetails = (data: unknown) => {
                    if (data instanceof SyntaxError) {
                        return conditional(data.message);
                    }
                    return conditional(data instanceof ZodError && formatZodError(<ZodError>data).join('\n'));
                }

                const body: RequestErrorBody = {
                    message: message,
                    data: error.data,
                    code: error.code,
                    details: createDetails(error.data)
                }

                ctx.status = error.status
                ctx.body = body

                return;
            }

            if (error instanceof HttpError) {
                return;
            }

            logger.error(error);

            ctx.status = 500;
            ctx.body = {message: "Internal server error."}
        }
    }
}