import {CommonQueryMethods, sql} from "slonik";
import {userConsentEntity} from "../entities/index.js";
import {convertToIdentifiers, expandFields} from "../utils/sql.js";
import {userConsentGuard} from "@astoniq/idp-schemas";
import {buildInsertIntoWithPool} from "../database/insert-into.js";

const {table, fields} = convertToIdentifiers(userConsentEntity);

export const createUserConsentQueries = (pool: CommonQueryMethods) => {

    const insertUserConsent = buildInsertIntoWithPool(pool, userConsentEntity, {
        returning: true
    })

    const findConsentByUserIdAndClientId = async (userId: string, clientId: string) =>
        pool.maybeOne(sql.type(userConsentGuard)`
            select ${expandFields(fields)}
            from ${table}
            where ${fields.userId} = ${userId}
              and ${fields.clientId} = ${clientId}
        `)

    return {
        findConsentByUserIdAndClientId,
        insertUserConsent
    }
}