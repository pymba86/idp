import {CommonQueryMethods, sql} from "slonik";
import {ConfigTypeGuard, ConfigKey,} from "@astoniq/idp-schemas";
import {configEntity} from "../entities/index.js";
import {convertToIdentifiers} from "../utils/sql.js";
import {z} from 'zod'

const {table, fields} = convertToIdentifiers(configEntity);

export const getConfigByKey = async <
    T extends ConfigKey,
>(pool: CommonQueryMethods, key: T): Promise<z.infer<ConfigTypeGuard[T]>> =>
    pool.oneFirst(sql.unsafe`
        select ${fields.value}
        from ${table}
        where ${fields.key} = ${key}
    `)

export const updateConfigByKey = async <
    T extends ConfigKey
>(
    pool: CommonQueryMethods,
    key: T,
    value: z.infer<ConfigTypeGuard[T]>
) =>
    pool.query(
        sql.unsafe`
            insert into ${table} (${fields.key}, ${fields.value})
            values (${key}, ${sql.jsonb(value)})
            on conflict (${fields.key})
                do update set ${fields.value}=excluded.${fields.value}
        `
    );

export const deleteConfigByKey = async (pool: CommonQueryMethods, key: ConfigKey) =>
    pool.query(sql.unsafe`
        delete
        from ${table}
        where ${fields.key} = ${key}
    `);
