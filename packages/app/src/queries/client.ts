import {CommonQueryMethods, sql} from "slonik";
import {clientGuard} from "@astoniq/idp-schemas";
import {clientEntity} from "../entities/index.js";
import {convertToIdentifiers, expandFields} from "../utils/sql.js";

const {table, fields} = convertToIdentifiers(clientEntity);

export const createClientQueries = (pool: CommonQueryMethods) => {

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