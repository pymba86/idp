import {configEntity} from "../entities/index.js";
import {convertToIdentifiers} from "../utils/sql.js";
import {CommonQueryMethods, DatabaseTransactionConnection, NotFoundError, sql} from "slonik";
import {Entity, EntityLike} from "../types/index.js";
import {MigrationState, MigrationConfigKey, configGuard, configGuards} from "@astoniq/idp-schemas";
import {z} from 'zod';

const {table, fields} = convertToIdentifiers(configEntity);

export const doesTableExist = async <T extends EntityLike<T>, P extends Partial<T>>(pool: CommonQueryMethods, entity: Entity<T, P>) => {
    const {rows: [data]} = await pool.query(
        sql.type(z.object(
            {reg: z.string().optional()}
        ))
            `select to_regclass(${entity.table}) as reg`
    );

    return Boolean(data?.reg);
};

export const getCurrentDatabaseMigrationTimestamp = async (pool: CommonQueryMethods) => {
    try {

        const migrationTableExist = await doesTableExist(pool, configEntity)

        if (!migrationTableExist) {
            return 0;
        }

        const result = await pool.one(sql.type(configGuard)`
            select *
            from ${table}
            where ${fields.key} = ${MigrationConfigKey.MigrationState}
        `)

        const parsed = configGuards[MigrationConfigKey.MigrationState]
            .safeParse(result?.value)

        return (parsed.success && parsed.data.timestamp) || 0;

    } catch (error: unknown) {
        if (error instanceof NotFoundError) {
            return 0;
        }
        throw error;
    }
}

export const updateMigrationTimestamp = async (
    connection: DatabaseTransactionConnection,
    timestamp: number
) => {
    const value: MigrationState = {
        timestamp
    }

    await connection.query(
        sql.unsafe`
            insert into ${table} (${fields.key}, ${fields.value})
            values (${MigrationConfigKey.MigrationState}, ${sql.jsonb(value)}) on conflict (${fields.key}) do
            update set ${fields.value}=excluded.${fields.value}`
    )
}