import {CommonQueryMethods, sql} from "slonik";
import {scopeGuard} from "@astoniq/idp-schemas";
import {scopeEntity} from "../entities/index.js";
import {convertToIdentifiers, expandFields} from "../utils/sql.js";

const {table, fields} = convertToIdentifiers(scopeEntity);

export const createScopeQueries = (pool: CommonQueryMethods) => {

    const findScopeById = async (id: string) =>
        pool.maybeOne(sql.type(scopeGuard)`
         select ${expandFields(fields)}
            from ${table}
            where ${fields.id} = ${id}
        `)

    return {
        findScopeById
    }
}