import {ZodType, ZodTypeDef} from "zod";
import {IRouterParamContext} from "koa-router";
import {RequestError, ResponseBodyError, StatusCodeError} from "../errors/index.js";
import type {Middleware} from 'koa';
import koaBody from 'koa-body';
import {Optional} from "../types/index.js";
import {assertThat} from "../utils/assert-that.js";

export type GuardConfig<QueryT, BodyT, ParametersT, ResponseT, FilesT> = {
    query?: ZodType<QueryT, ZodTypeDef, unknown>
    body?: ZodType<BodyT, ZodTypeDef, unknown>
    params?: ZodType<ParametersT, ZodTypeDef, unknown>
    response?: ZodType<ResponseT, ZodTypeDef, unknown>
    status?: number | number[]
    files?: ZodType<FilesT, ZodTypeDef, unknown>
}

export type GuardedRequest<QueryT, BodyT, ParametersT, FilesT> = {
    query: QueryT;
    body: BodyT;
    params: ParametersT;
    files: FilesT;
}

export type WithGuardedRequestContext<
    ContextT extends IRouterParamContext,
    GuardQueryT,
    GuardBodyT,
    GuardParametersT,
    GuardFilesT> = ContextT & {
    guard: GuardedRequest<GuardQueryT, GuardBodyT, GuardParametersT, GuardFilesT>
}

export type WithGuardConfig<
    Type, GuardQueryT = unknown, GuardBodyT = unknown, GuardParametersT = unknown, GuardResponseT = unknown,
    GuardFilesT = undefined> = Type & {
    config: GuardConfig<GuardQueryT, GuardBodyT, GuardParametersT, GuardResponseT, GuardFilesT>
}

export const parse = <Output, Definition extends ZodTypeDef, Input>(
    type: 'query' | 'body' | 'params' | 'files',
    guard: ZodType<Output, Definition, Input>,
    data: unknown
) => {
    try {
        return guard.parse(data)
    } catch (error: unknown) {
        throw new RequestError({code: 'invalid_input', slots: {type}}, error)
    }
}

const tryParse = <Output, Definition extends ZodTypeDef, Input>(
    type: 'query' | 'body' | 'params' | 'files',
    guard: Optional<ZodType<Output, Definition, Input>>,
    data: unknown
) => {
    if (!guard) {
        return
    }

    return parse(type, guard, data)
}

export default function koaGuard<StateT, ContextT extends IRouterParamContext,
    GuardQueryT = undefined, GuardBodyT = undefined, GuardParametersT = undefined,
    GuardResponseT = unknown, GuardFilesT = undefined>(
    {
        query,
        body,
        params,
        response,
        status,
        files
    }:
        GuardConfig<
            GuardQueryT,
            GuardBodyT,
            GuardParametersT,
            GuardResponseT,
            GuardFilesT>): Middleware<StateT, WithGuardedRequestContext<
    ContextT, GuardQueryT, GuardBodyT, GuardParametersT, GuardFilesT>, GuardResponseT> {

    const guard: Middleware<StateT, WithGuardedRequestContext<
        ContextT, GuardQueryT, GuardBodyT, GuardParametersT, GuardFilesT>, GuardResponseT>
        = async (ctx, next) => {
        ctx.guard = {
            query: tryParse('query', query, ctx.request.query),
            body: tryParse('body', body, ctx.request.body),
            params: tryParse('params', params, ctx.params),
            files: tryParse('files', files, ctx.request.files)
        } as GuardedRequest<GuardQueryT, GuardBodyT, GuardParametersT, GuardFilesT>;

        return next();
    }

    const guardMiddleware: WithGuardConfig<
        Middleware<
            StateT,
            WithGuardedRequestContext<ContextT, GuardQueryT, GuardBodyT, GuardParametersT, GuardFilesT>,
            GuardResponseT>
    > = async function (ctx, next) {

        const assertStatusCode = (value: number) => {
            if (status === undefined) {
                return
            }

            assertThat(Array.isArray(status) ? status.includes(value) : status === value,
                new StatusCodeError(status, value))
        }

        try {
            await (body ?? files ? koaBody<StateT, ContextT>({multipart: Boolean(files)})
            (ctx, async () => guard(ctx, next)) : guard(ctx, next))
        } catch (error: unknown) {
            if (error instanceof RequestError) {
                assertStatusCode(error.status)
            }
            throw error
        }

        assertStatusCode(ctx.response.status)

        if (response != undefined) {
            const result = response.safeParse(ctx.body)

            if (result.success) {
                ctx.body = result.data
            } else {
                throw new ResponseBodyError(result.error)
            }
        }
    }

    guardMiddleware.config = {query, body, params, response, status};

    return guardMiddleware;
}
