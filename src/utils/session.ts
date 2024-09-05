import {Context} from "koa";
import {nanoid} from "nanoid";

export type SessionRecord = Record<string, any>;

export type SessionData<T = SessionRecord> = {
    cookie: Cookie;
    data: Partial<T>
}

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

    set(id: string, data: SessionData<T>): Promise<void>;

    destroy(id: string): Promise<void>;

    touch(id: string, data: SessionData<T>): Promise<void>;
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

        const createSession = (
            session: {
                id: string,
                isNew: boolean,
                isDestroyed: boolean,
                isTouched: boolean,
            } & SessionData<T>): Session<T> => {

            return {
                ...session,
                async commit() {
                    await store.set(this.id, this);
                    commitSession(ctx, name, this);
                },
                touch() {
                    this.isTouched = true;
                    const now = Date.now()
                    this.cookie.expires = new Date(now + this.cookie.maxAge! * 1000);
                },
                async regenerate() {
                    await store.destroy(this.id)
                    this.id = genId()
                },
                async destroy() {
                    this.isDestroyed = true;
                    this.cookie.expires = new Date(1);
                    await store.destroy(this.id)
                    commitSession(ctx, name, this);
                }
            }
        }

        const sessionId = ctx.cookies.get(name);

        if (sessionId) {

            const storeSession = await store.get(sessionId);

            if (storeSession) {

                const session = createSession({
                    ...storeSession,
                    id: sessionId,
                    isDestroyed: false,
                    isNew: false,
                    isTouched: false,
                })

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
        }

        return createSession({
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
            data: {}
        })
    }
}