import {Context} from "koa";
import {nanoid} from "nanoid";
import {SessionStoreData} from "@astoniq/idp-schemas";
import {Nullable} from "../types/index.js";


export type SessionData = {
    data: Partial<SessionStoreData>;
    expiresAt: number;
    remember: boolean;
} & Cookie

export type Session = {
    id: string;
    isNew: boolean;
    isDestroyed: boolean;
    commit(): Promise<void>;
    touch(remember: boolean): void;
    destroy(): Promise<void>;
    regenerate(): Promise<void>;
} & SessionData

export type Cookie = {
    httpOnly: boolean;
    path: string;
    domain?: string | undefined;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
}

export interface SessionStore {
    get(id: string): Promise<Nullable<SessionData>>;

    set(id: string, session: Session): Promise<void>;

    destroy(id: string): Promise<void>;
}

export interface Options {
    name: string;
    store: SessionStore;
    genId?: () => string;
    cookie: Cookie;
    maxAge: number;
    rememberAge: number;
}

export function commitSession(
    ctx: Context,
    name: string,
    session: Session) {
    if (!ctx.headerSent) {
        ctx.cookies.set(name, session.id, {
            httpOnly: session.httpOnly,
            path: session.path,
            expires: session.remember ? new Date(session.expiresAt): undefined,
            domain: session.domain,
            secure: session.secure,
            sameSite: session.sameSite
        })
    }
}

export function nextSession(options: Options) {

    const {
        name,
        store,
        cookie,
        genId = nanoid,
        maxAge,
        rememberAge,
    } = options

    return async (ctx: Context): Promise<Session> => {

        const createSession = (
            session: {
                id: string,
                isNew: boolean,
                isDestroyed: boolean,
            } & SessionData): Session => {

            return {
                ...session,
                async commit() {

                    const now = Date.now();

                    if (this.remember) {
                        this.expiresAt = now + rememberAge * 1000;
                    } else {
                        this.expiresAt = now + maxAge * 1000;
                    }

                    await store.set(this.id, this);

                    commitSession(ctx, name, this);
                },
                touch(remember) {
                    this.remember = remember
                },
                async regenerate() {
                    await store.destroy(this.id)
                    this.id = genId()
                },
                async destroy() {
                    this.expiresAt = 0;
                    this.isDestroyed = true;
                    await store.destroy(this.id);
                    commitSession(ctx, name, this);
                }
            }
        }

        const id = ctx.cookies.get(name);

        if (id) {

            const session = await store.get(id);

            if (session) {

                return createSession({
                    ...session,
                    id,
                    isDestroyed: false,
                    isNew: false,
                })
            }
        }

        const now = Date.now();
        const expiresAt = now + maxAge * 1000;

        return createSession({
            id: genId(),
            isNew: true,
            isDestroyed: false,
            path: cookie.path,
            httpOnly: cookie.httpOnly,
            domain: cookie.domain,
            sameSite: cookie.sameSite,
            secure: cookie.secure,
            data: {},
            expiresAt,
            remember: false,
        })
    }
}