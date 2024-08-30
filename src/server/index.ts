import {Queries} from "../queries/index.js";
import {Config} from "../config/index.js";
import Koa from "koa";
import mount from "koa-mount";
import {initApis} from "../routes/index.js";
import {Eta} from "eta";
import path from "path";
import {fileURLToPath} from "url";

export type ServerOptions = {
    queries: Queries
    config: Config
}

const serverTimeout = 120_000;

const currentDirname = path.dirname(fileURLToPath(import.meta['url']))

const viewsDirectory = path.join(currentDirname, "..", "views");

export async function startServer(options: ServerOptions) {

    const {
        config
    } = options

    const app = new Koa()

    const eta = new Eta({
        views: viewsDirectory,
        defaultExtension: '.html'
    });

    app.use(mount('/eta', initApis({eta})))

    const server = app.listen(
        config.serverPort, config.serverHost);

    server.setTimeout(serverTimeout)
}