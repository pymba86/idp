import {Context} from "koa";
import {nanoid} from "nanoid";

export type SessionRecord = Record<string, any>;

export type SessionData<T = SessionRecord> = {
    cookie: Cookie;
} & T;

export type Session<T extends SessionRecord = SessionRecord> = {
    id: string;
    isNew: boolean;
    isTouched: boolean;
    isDestroyed: boolean;
    commit(): Promise<void>;
    touch(): void;
    destroy(): Promise<void>;
    regenerate(): Promise<void>;
} & SessionData<T>

export type Cookie = {
    httpOnly: boolean;
    path: string;
    domain?: string | undefined;
    secure: boolean;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
} & (
    | {
    maxAge?: undefined;
    expires?: undefined
}
    | {
    maxAge: number;
    expires: Date;
}
    );

export interface SessionStore<T extends SessionRecord> {
    get(id: string): Promise<SessionData<T>>;

    set(id: string, session: SessionData<T>): Promise<void>;

    destroy(id: string): Promise<void>;

    touch(id: string, session: SessionData<T>): Promise<void>;
}

export interface Options<T extends SessionRecord> {
    name: string;
    store: SessionStore<T>;
    genId?: () => string;
    touchAfter?: number;
    cookie: Partial<Cookie>;
}

export function commitSession(
    ctx: Context,
    name: string,
    {cookie, id}: Pick<Session, 'cookie' | 'id'>) {
    if (!ctx.headerSent) {
        ctx.cookies.set(name, id, cookie)
    }
}

export function nextSession<T extends SessionRecord>(options: Options<T>) {

    const {
        name,
        store,
        cookie,
        genId = nanoid,
        touchAfter = 0
    } = options

    return async (ctx: Context): Promise<Session<T>> => {

        const sessionId = ctx.cookies.get(name);

        const storeSession = sessionId
            ? await store.get(sessionId) : null;

        const commit = (session: Session<T>) => async () => {
            await store.set(session.id, session);
            commitSession(ctx, name, session);
        }

        const destroy = (session: Session<T>) => async () => {
            session.isDestroyed = true;
            session.cookie.expires = new Date(1);
            await store.destroy(session.id)
            commitSession(ctx, name, session);
        }

        const touch = (session: Session<T>) => () => {
            session.isTouched = true;
            const now = Date.now()
            session.cookie.expires = new Date(now + session.cookie.maxAge * 1000);
        }

        const regenerate = (session: Session<T>) => async () => {
            await store.destroy(session.id)
            session.id = genId()
        }

        if (storeSession) {

            const session: Session<T> = {
                ...storeSession,
                id: sessionId,
                isDestroyed: false,
                isNew: false,
                isTouched: false,
                commit: commit(this),
                destroy: destroy(this),
                touch: touch(this),
                regenerate: regenerate(this)
            }

            if (touchAfter >= 0 && session.cookie.expires) {

                const lastTouchedTime =
                    session.cookie.expires.getTime()
                    - session.cookie.maxAge * 1000;

                if (Date.now() - lastTouchedTime >= touchAfter * 1000) {
                    session.touch();
                }
            }

            return session
        }

        return {
            id: genId(),
            isNew: true,
            isDestroyed: false,
            isTouched: false,
            cookie: {
                path: cookie.path || "/",
                httpOnly: cookie.httpOnly ?? true,
                domain: cookie.domain || undefined,
                sameSite: cookie.sameSite,
                secure: cookie.secure || false,
            },
            commit: commit(this),
            destroy: destroy(this),
            touch: touch(this),
            regenerate: regenerate(this)
        }
    }
}