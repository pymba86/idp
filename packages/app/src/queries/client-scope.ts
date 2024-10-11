import {CommonQueryMethods, sql} from "slonik";
import {clientGuard, scopeGuard} from "@astoniq/idp-schemas";
import {clientScopeEntity, scopeEntity} from "../entities/index.js";
import {convertToIdentifiers, expandFields} from "../utils/sql.js";

const {table, fields} = convertToIdentifiers(clientScopeEntity, true);

const scopes = convertToIdentifiers(scopeEntity, true);

export const createClientScopeQueries = (pool: CommonQueryMethods) => {

    const findClientScopeById = async (id: string) =>
        pool.maybeOne(sql.type(clientGuard)`
            select ${expandFields(fields)}
            from ${table}
            where ${fields.id} = ${id}
        `)

    const findScopesByClientId = async (clientId: string) =>
        pool.any(sql.type(scopeGuard)`
            select ${expandFields(scopes.fields)}
            from ${table}
                     inner join ${scopes.table} on ${scopes.fields.id} = ${fields.scopeId}
            where ${fields.clientId} = ${clientId}
        `);


    return {
        findClientScopeById,
        findScopesByClientId
    }
}