import {CommonQueryMethods, sql} from "slonik";
import {userProviderEntity} from "../entities/index.js";
import {convertToIdentifiers, expandFields} from "../utils/sql.js";
import {userProviderGuard} from "@astoniq/idp-schemas";

const {table, fields} = convertToIdentifiers(userProviderEntity);

export const createUserProviderQueries = (pool: CommonQueryMethods) => {

    const findUserProviderByIdentityId = async (providerId: string, identityId: string) =>
        pool.maybeOne(sql.type(userProviderGuard)`
            select ${expandFields(fields)}
            from ${table}
            where ${fields.identityId} = ${identityId}
            and ${fields.providerId} = ${providerId}
        `)

    return {
        findUserProviderByIdentityId
    }
}