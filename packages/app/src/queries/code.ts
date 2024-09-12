import {CommonQueryMethods, sql} from "slonik";
import {codeGuard} from "@astoniq/idp-schemas";
import {codeEntity} from "../entities/index.js";
import {convertToIdentifiers, expandFields} from "../utils/sql.js";
import {DeletionError} from "../errors/slonik-error.js";

const {table, fields} = convertToIdentifiers(codeEntity);

export const createCodeQueries = (pool: CommonQueryMethods) => {

    const findAuthorizationCode = async (id: string) =>
        pool.maybeOne(sql.type(codeGuard)`
            select ${expandFields(fields)}
            from ${table}
            where ${fields.id} = ${id}
        `)

    const deleteAuthorizationCode = async (id: string) => {
        const {rowCount} = await pool.query(sql.unsafe`
            delete
            from ${table}
            where ${fields.id} = ${id}
        `);

        if (rowCount < 1) {
            throw new DeletionError(codeEntity.table, id);
        }
    }

    return {
        findAuthorizationCode,
        deleteAuthorizationCode
    }
}