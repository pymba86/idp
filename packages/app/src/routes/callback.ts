import Router from "koa-router";
import koaBody from "koa-body";

export default function callbackRoutes<T extends Router>(router: T) {

    router.get('/callback', koaBody(),
        async (ctx, next) => {
            ctx.status = 204;

            return next();
        });
}