declare module 'koa-body' {
    import type {Middleware} from 'koa';
    import type {IKoaBodyOptions} from 'koa-body';

    declare function koaBody<
        StateT = Record<string, unknown>,
        ContextT = Record<string, unknown>,
        ResponseBodyT = unknown,
    >(options?: IKoaBodyOptions): Middleware<StateT, ContextT, ResponseBodyT>;

    export = koaBody;
}
