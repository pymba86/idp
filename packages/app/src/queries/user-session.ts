import {CommonQueryMethods, sql} from "slonik";
import {userSessionGuard} from "@astoniq/idp-schemas";
import {convertToIdentifiers, expandFields} from "../utils/sql.js";
import {userSessionEntity} from "../entities/index.js";
import {assertThat} from "../utils/assert-that.js";
import {InsertionError} from "../errors/slonik-error.js";

const {table, fields} = convertToIdentifiers(userSessionEntity);

export const createUserSessionQueries = (pool: CommonQueryMethods) => {

    const findUserSessionById = async (id: string) =>
        pool.maybeOne(sql.type(userSessionGuard)`
            select ${expandFields(fields)}
            from ${table}
            where ${fields.id} = ${id}
        `)

    const insertUserSession = async (id: string, userId: string, sessionId: string) => {
        const entry = await pool.maybeOne(sql.type(userSessionGuard)`
            insert into ${table} (${fields.id}, ${fields.userId}, ${fields.sessionId})
            values (${id}, ${userId}, ${sessionId})
            returning *
        `)

        assertThat(entry, new InsertionError(userSessionEntity, {id, userId, sessionId}));

        return entry
    }

    return {
        insertUserSession,
        findUserSessionById
    }
}