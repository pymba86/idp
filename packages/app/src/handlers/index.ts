import {nextSession} from "./session.js";
import {nanoid} from "nanoid";
import {createRenderTemplate} from "./render.js";
import {createSessionStore} from "./data.js";
import {Queries} from "../queries/index.js";
import {Config} from "../config/index.js";
import {getBaseUrl} from "./url.js";

export type Handlers = ReturnType<typeof createHandlers>

export function createHandlers(options: {
    queries: Queries,
    config: Config
}) {

    const {
        queries,
        config
    } = options

    const getSession = nextSession({
        name: 'sid',
        store: createSessionStore(queries.pool),
        genId: () => nanoid(),
        cookie: {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
        },
        maxAge: 60 * 60 * 24 * 30, // 30 day
    })

    const renderTemplate = createRenderTemplate()

    const baseUrl = getBaseUrl(config)

    return {
        baseUrl,
        renderTemplate,
        getSession
    }
}