import {nextSession, SessionData, SessionStore} from "../utils/session.js";
import {nanoid} from "nanoid";
import {AuthContext} from "../types/auth.js";
import {createRender} from "./render.js";

export type StoreData = {
    userSessionId: string,
    authContext: AuthContext
}

export const createStore = (): SessionStore<StoreData> => {
    const store = new Map()

    const get = async (sid: string) => {
        const sess = store.get(sid);
        if (sess) {
            return JSON.parse(sess, (_key, value) => {
                return value;
            });
        }
        return null;
    }

    async function set(sid: string, sess: SessionData<StoreData>) {
        store.set(sid, JSON.stringify(sess));
    }

    async function destroy(sid: string) {
        store.delete(sid);
    }

    async function touch(sid: string, sess: SessionData) {
        store.set(sid, JSON.stringify(sess));
    }

    return {
        get,
        set,
        destroy,
        touch
    }
}

export type Handlers = ReturnType<typeof createHandlers>

export function createHandlers() {

    const store = createStore()

    const getSession = nextSession({
        name: 'sid',
        store,
        genId: () => nanoid(),
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
        }
    })

    const render = createRender()

    return {
        render,
        getSession
    }
}