import {IRouterParamContext} from "koa-router";
import {Middleware} from "koa";

type Props = Record<string | number | symbol, unknown>;

export type Page = {
    readonly component: string;
    props: Props;
    readonly url: string;
};

export type Options = {
    readonly html: (page: Page) => string;
}

export type Inertia = {
    readonly render: (component: string, props?: Props) => Promise<Inertia>;
};

export type WithInertiaContext<Context extends IRouterParamContext = IRouterParamContext> = Context & {
    inertia: Inertia
}

const headers = {
    xInertia: 'x-inertia',
    xInertiaVersion: 'x-inertia-version',
    xInertiaLocation: 'x-inertia-location',
    xInertiaPartialData: 'x-inertia-partial-data',
    xInertiaPartialComponent: 'x-inertia-partial-component',
};

export default function koaInertia<StateT, ContextT extends IRouterParamContext>(
    {html}: Options
): Middleware<StateT, WithInertiaContext<ContextT>> {

    return async (ctx, next) => {

        ctx.inertia = {
            async render(component, props = {}) {

                const page: Page = {
                    component,
                    props,
                    url: ctx.originalUrl || ctx.url
                };

                if (ctx.headers[headers.xInertia]) {
                    ctx.set({
                        'Content-Type': 'application/json',
                        [headers.xInertia]: 'true',
                        Vary: 'Accept',
                    });
                    ctx.body = JSON.stringify(page);
                } else {
                    ctx.set({
                        'Content-Type': 'text/html',
                    });
                    ctx.body = html(page);
                }
                return this;
            },
        };

        return next();
    }
}