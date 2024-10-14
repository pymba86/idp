import {nextSession} from "./session.js";
import {nanoid} from "nanoid";
import {createRender} from "./render.js";
import {createSessionStore} from "./data.js";
import {CommonQueryMethods} from "slonik";


export type Handlers = ReturnType<typeof createHandlers>

export function createHandlers(pool: CommonQueryMethods) {

    const getSession = nextSession({
        name: 'sid',
        store: createSessionStore(pool),
        genId: () => nanoid(),
        cookie: {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
        },
        maxAge: 60 * 60 * 24 * 30, // 30 day
    })

    const render = createRender()

    return {
        render,
        getSession
    }
}