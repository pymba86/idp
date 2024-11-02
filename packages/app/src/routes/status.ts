import koaGuard from "../middlewares/koa-guard.js";
import Router from "koa-router";

export default function statusRoutes<T extends Router>(router: T) {

    router.get('/status',
        koaGuard({
            status: 204
        }),
        async (ctx, next) => {
            ctx.status = 204;

            return next();
        });
}