import {Queries} from "../queries/index.js";
import {Config} from "../config/index.js";
import Koa from "koa";
import mount from "koa-mount";
import {initApis} from "../routes/index.js";
import {Eta} from "eta";
import path from "path";
import {fileURLToPath} from "url";
import koaErrorHandler from "../middlewares/koa-error-handler.js";
import {initAuthApis} from "../auth/index.js";

export type ServerOptions = {
    queries: Queries
    config: Config
}

const serverTimeout = 120_000;

const currentDirname = path.dirname(fileURLToPath(import.meta['url']))

const viewsDirectory = path.join(currentDirname, "..", "views");

export async function startServer(options: ServerOptions) {

    const {
        config,
        queries
    } = options

    const app = new Koa()

    app.use(koaErrorHandler());

    const eta = new Eta({
        views: viewsDirectory,
        defaultExtension: '.html'
    });

    app.use(mount('/eta', initApis({eta})))

    app.use(mount('/auth', initAuthApis({eta, queries})))

    const server = app.listen(
        config.serverPort, config.serverHost);

    server.setTimeout(serverTimeout)
}