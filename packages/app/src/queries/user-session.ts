import {CommonQueryMethods, sql} from "slonik";
import {clientGuard} from "@astoniq/idp-schemas";
import {convertToIdentifiers, expandFields} from "../utils/sql.js";
import {userSessionEntity} from "../entities/index.js";

const {table, fields} = convertToIdentifiers(userSessionEntity);

export const createUserSessionQueries = (pool: CommonQueryMethods) => {

    const findClientById = async (id: string) =>
        pool.maybeOne(sql.type(clientGuard)`
         select ${expandFields(fields)}
            from ${table}
            where ${fields.id} = ${id}
        `)

    return {
        findClientById
    }
}