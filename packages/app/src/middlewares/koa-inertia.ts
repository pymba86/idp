import {IRouterParamContext} from "koa-router";
import {Middleware} from "koa";

type Props = Record<string | number | symbol, unknown>;

export type Page = {
    readonly component: string;
    props: Props;
    readonly url: string;
};

export type Options = {
    readonly html: (page: Page) => Promise<string>;
}

export type Inertia = {
    readonly render: (component: string, props?: Props) => void;
};

export type WithInertiaContext<Context extends IRouterParamContext = IRouterParamContext> = Context & {
    inertia: Inertia
}

const headers = {
    xInertia: 'x-inertia',
    xInertiaVersion: 'x-inertia-version',
    xInertiaLocation: 'x-inertia-location',
    Vary: 'Vary',
    ContentType: 'Content-Type'
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
                        [headers.xInertia]: 'true',
                        [headers.ContentType]: 'application/json',
                        [headers.Vary]: 'Accept',
                    });
                    ctx.body = JSON.stringify(page);
                } else {
                    ctx.set({
                        [headers.ContentType]: 'text/html',
                    });
                    ctx.body = await html(page);
                }
            },
        };

        return next();
    }
}