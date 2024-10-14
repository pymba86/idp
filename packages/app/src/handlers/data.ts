import {CommonQueryMethods, sql} from "slonik";
import {sessionGuard,} from "@astoniq/idp-schemas";
import {sessionEntity} from "../entities/index.js";
import {convertToIdentifiers, expandFields} from "../utils/sql.js";
import {Session, SessionData, SessionStore} from "./session.js";
import {buildInsertIntoWithPool} from "../database/insert-into.js";
import {buildUpdateWhereWithPool} from "../database/update-where.js";
import {Nullable} from "../types/index.js";

const {table, fields} = convertToIdentifiers(sessionEntity);

export const createSessionStore = (pool: CommonQueryMethods): SessionStore => {

    const insertSession = buildInsertIntoWithPool(pool, sessionEntity)

    const updateSession = buildUpdateWhereWithPool(pool, sessionEntity)

    return {
        async destroy(id: string): Promise<void> {
            return Promise.reject(`${id}`);
        },
        async set(id: string, session: Session): Promise<void> {
            if (session.isNew) {
                await insertSession(session)
            }  else {
                await updateSession({
                    set: session,
                    jsonbMode: 'replace',
                    where: {
                        id
                    }
                })
            }
        },
        async get(id: string): Promise<Nullable<SessionData>> {
            return pool.maybeOne(sql.type(sessionGuard)`
                select ${expandFields(fields)}
                from ${table}
                where ${fields.id} = ${id}
            `)
        }
    }


}