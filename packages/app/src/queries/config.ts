import {CommonQueryMethods, sql} from "slonik";
import {
    ConfigGuard,
    configGuard,
    ConfigKey,
} from "@astoniq/idp-schemas";
import {configEntity} from "../entities/index.js";
import {convertToIdentifiers} from "../utils/sql.js";
import {z} from 'zod'
import {DeletionError} from "../errors/slonik-error.js";

const {table, fields} = convertToIdentifiers(configEntity);

export const getConfigRowByKey = async (pool: CommonQueryMethods, key: ConfigKey) =>
    pool.maybeOne(sql.type(configGuard)`
        select ${sql.join([fields.key, fields.value], sql.fragment`,`)}
        from ${table}
        where ${fields.key} = ${key}
    `)

export const getConfigRowsByKeys = async (pool: CommonQueryMethods, keys: ConfigKey[]) =>
    pool.any(sql.type(configGuard)`
        select ${sql.join([fields.key, fields.value], sql.fragment`,`)}
        from ${table}
        where ${fields.key} in (${sql.join(keys, sql.fragment`,`)})
    `)

export const updateConfigValueByKey = async <T extends ConfigKey>(
    pool: CommonQueryMethods,
    key: T,
    value: z.infer<ConfigGuard[T]>
) =>
    pool.query(
        sql.unsafe`
            insert into ${table} (${fields.key}, ${fields.value})
            values (${key}, ${sql.jsonb(value)})
            on conflict (${fields.key})
                do update set ${fields.value}=excluded.${fields.value}
        `
    );

export const deleteConfigRowByKey = async (pool: CommonQueryMethods, key: ConfigKey) => {
    const {rowCount} = await pool.query(sql.unsafe`
        delete
        from ${table}
        where ${fields.key} = ${key}
    `);

    if (rowCount < 1) {
        throw new DeletionError(configEntity.table, key);
    }
};