import {CommonQueryMethods, sql} from "slonik";
import {refreshTokenEntity} from "../entities/index.js";
import {buildInsertIntoWithPool} from "../database/insert-into.js";
import {refreshTokenGuard} from "@astoniq/idp-schemas";
import {convertToIdentifiers, expandFields} from "../utils/sql.js";

const {table, fields} = convertToIdentifiers(refreshTokenEntity);

export const createRefreshTokenQueries = (pool: CommonQueryMethods) => {

    const insertRefreshToken = buildInsertIntoWithPool(pool, refreshTokenEntity, {
        returning: true
    })

    const findRefreshTokenById = (id: string, clientId: string) => {
        return pool.maybeOne(sql.type(refreshTokenGuard)`
            select ${expandFields(fields)}
            from ${table}
            where ${fields.id} = ${id}
              and ${fields.clientId} = ${clientId}
        `)
    }

    const deleteRefreshTokenById = async (id: string, clientId: string) => {
        return pool.query(sql.unsafe`
            delete
            from ${table}
            where ${fields.id} = ${id}
              and ${fields.clientId} = ${clientId}
        `);
    };

    return {
        insertRefreshToken,
        findRefreshTokenById,
        deleteRefreshTokenById
    }
}