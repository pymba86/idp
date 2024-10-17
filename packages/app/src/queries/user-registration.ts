import {CommonQueryMethods, sql} from "slonik";
import { userRegistrationEntity} from "../entities/index.js";
import {convertToIdentifiers, expandFields} from "../utils/sql.js";
import {userRegistrationGuard} from "@astoniq/idp-schemas";
import {buildInsertIntoWithPool} from "../database/insert-into.js";

const {table, fields} = convertToIdentifiers(userRegistrationEntity);

export const createUserRegistrationQueries = (pool: CommonQueryMethods) => {

    const insertUserRegistration = buildInsertIntoWithPool(pool, userRegistrationEntity, {
        returning: true
    })

    const findUserRegistrationById = async (id: string) =>
        pool.maybeOne(sql.type(userRegistrationGuard)`
            select ${expandFields(fields)}
            from ${table}
            where ${fields.id} = ${id}
        `)

    return {
        findUserRegistrationById,
        insertUserRegistration
    }
}