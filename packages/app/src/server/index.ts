import {Queries} from "../queries/index.js";
import {Config} from "../config/index.js";
import Koa from "koa";
import mount from "koa-mount";
import {initApis} from "../routes/index.js";
import koaErrorHandler from "../middlewares/koa-error-handler.js";
import {initAuthApis} from "../auth/index.js";
import {createHandlers} from "../handlers/index.js";
import {createLibraries} from "../libraries/index.js";
import {createScheduler} from "../scheduler/index.js";
import {createTasks} from "../tasks/index.js";
import {DatabasePool} from "slonik";

export type ServerOptions = {
    queries: Queries
    pool: DatabasePool
    config: Config
}

const serverTimeout = 120_000;

export async function startServer(options: ServerOptions) {

    const {
        config,
        queries,
        pool,
    } = options

    const app = new Koa()

    app.use(koaErrorHandler());

    const handlers = createHandlers({
        queries,
        config
    })

    const libraries = createLibraries({
        queries,
        handlers,
    })

    const scheduler = createScheduler({
        pool
    })

    const tasks = createTasks({
        scheduler,
        queries,
        handlers
    })

    app.use(mount('/', initApis({
        handlers,
        libraries,
        tasks,
        queries
    })))

    app.use(mount('/auth', initAuthApis({
        queries,
        tasks,
        scheduler,
        handlers,
        libraries
    })))

    await scheduler.start()

    const server = app.listen(
        config.serverPort, config.serverHost);

    server.setTimeout(serverTimeout)
}