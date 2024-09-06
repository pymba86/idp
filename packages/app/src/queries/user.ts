import {CommonQueryMethods, sql} from "slonik";
import {convertToIdentifiers, expandFields} from "../utils/sql.js";
import {userEntity} from "../entities/index.js";
import {userGuard} from "@astoniq/idp-schemas";

const {table, fields} = convertToIdentifiers(userEntity);

export const createUserQueries = (pool: CommonQueryMethods) => {

    const findUserByEmail = async (email: string) =>
        pool.maybeOne(sql.type(userGuard)`
         select ${expandFields(fields)}
            from ${table}
            where ${fields.email} = ${email}
        `)


    return {
        findUserByEmail
    }
}