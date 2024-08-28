import {Queries} from "../queries/index.js";
import {Config} from "../config/index.js";
import Koa from "koa";

export type ServerOptions = {
    queries: Queries
    config: Config
}

const serverTimeout = 120_000;

export async function startServer(options: ServerOptions) {

    const {
        config
    } = options

    const app = new Koa()


    const server = app.listen(
        config.serverPort, config.serverHost);

    server.setTimeout(serverTimeout)
}