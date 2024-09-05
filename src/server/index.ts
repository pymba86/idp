import {Queries} from "../queries/index.js";
import {Config} from "../config/index.js";
import Koa from "koa";
import mount from "koa-mount";
import {initApis} from "../routes/index.js";
import koaErrorHandler from "../middlewares/koa-error-handler.js";
import {initAuthApis} from "../auth/index.js";
import {createHandlers} from "../handlers/index.js";

export type ServerOptions = {
    queries: Queries
    config: Config
}

const serverTimeout = 120_000;

export async function startServer(options: ServerOptions) {

    const {
        config,
        queries
    } = options

    const app = new Koa()

    app.use(koaErrorHandler());


    const handlers = createHandlers()

    app.use(mount('/eta', initApis({handlers})))

    app.use(mount('/auth', initAuthApis({
        queries,
        handlers
    })))

    const server = app.listen(
        config.serverPort, config.serverHost);

    server.setTimeout(serverTimeout)
}