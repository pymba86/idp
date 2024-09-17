import {Queries} from "../queries/index.js";
import {Config, Keys} from "../config/index.js";
import Koa from "koa";
import mount from "koa-mount";
import {initApis} from "../routes/index.js";
import koaErrorHandler from "../middlewares/koa-error-handler.js";
import {initAuthApis} from "../auth/index.js";
import {createHandlers} from "../handlers/index.js";
import {createLibraries} from "../libraries/index.js";

export type ServerOptions = {
    queries: Queries
    config: Config
    keys: Keys
}

const serverTimeout = 120_000;

export async function startServer(options: ServerOptions) {

    const {
        config,
        queries,
        keys
    } = options

    const app = new Koa()

    app.use(koaErrorHandler());

    const handlers = createHandlers()

    const libraries = createLibraries({
        queries,
        keys
    })

    app.use(mount('/', initApis({handlers, keys})))

    app.use(mount('/auth', initAuthApis({
        queries,
        handlers,
        libraries
    })))

    const server = app.listen(
        config.serverPort, config.serverHost);

    server.setTimeout(serverTimeout)
}