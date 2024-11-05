import {CommonQueryMethods, sql} from "slonik";
import {providerGuard} from "@astoniq/idp-schemas";
import {providerEntity} from "../entities/index.js";
import {convertToIdentifiers, expandFields} from "../utils/sql.js";

const {table, fields} = convertToIdentifiers(providerEntity);

export const createProviderQueries = (pool: CommonQueryMethods) => {

    const findProviderLinkById = async (id: string) =>
        pool.maybeOne(sql.type(providerGuard)`
            select ${expandFields(fields)}
            from ${table}
            where ${fields.id} = ${id}
              and ${fields.link} = true
        `)

    const findProvidersSso = async () =>
        pool.any(sql.type(providerGuard)`
            select ${expandFields(fields)}
            from ${table}
            where ${fields.sso} = true
        `)

    return {
        findProvidersSso,
        findProviderLinkById
    }
}