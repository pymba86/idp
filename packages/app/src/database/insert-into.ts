import {CommonQueryMethods, IdentifierSqlToken, sql} from "slonik";
import {
    conditionalSql,
    convertToIdentifiers,
    convertToPrimitiveOrSql,
    excludeAutoSetFields,
    OmitAutoSetFields
} from "../utils/sql.js";
import {Entity, EntityLike} from "../types/index.js";
import {InsertionError} from "../errors/slonik-error.js";
import {assertThat} from "../utils/assert-that.js";

type OnConflict = |
    {
        fields: IdentifierSqlToken[],
        setExcludedFields: IdentifierSqlToken[],
        ignore?: false
    } | { ignore: true }

type InsertIntoConfig = {
    returning?: false;
    onConflict?: OnConflict;
};

type InsertIntoConfigReturning = {
    returning: true;
    onConflict?: OnConflict;
};

type BuildInsertInto = {
    <T extends EntityLike<T>,
        P extends Partial<T>>
    (
        pool: CommonQueryMethods,
        entity: Entity<T, P>,
        config?: InsertIntoConfig): (data: OmitAutoSetFields<P>) => Promise<void>;
    <T extends EntityLike<T>,
        P extends Partial<T>>
    (
        pool: CommonQueryMethods,
        entity: Entity<T, P>,
        config?: InsertIntoConfigReturning): (data: OmitAutoSetFields<P>) => Promise<T>;
}

const setExcluded = (...fields: IdentifierSqlToken[]) =>
    sql.join(fields.map((field) => sql.fragment`${field}=excluded.${field}`), sql.fragment`, `)

export const buildInsertIntoWithPool: BuildInsertInto =
    <T extends EntityLike<T>,
        P extends Partial<T>>
    (
        pool: CommonQueryMethods,
        entity: Entity<T, P>,
        config?: InsertIntoConfig | InsertIntoConfigReturning) => {

        const {fields, table} = convertToIdentifiers(entity);
        const keys = excludeAutoSetFields(entity);
        const onConflict = config?.onConflict;
        const returning = Boolean(config?.returning);

        return async (data: OmitAutoSetFields<P>): Promise<T | void> => {
            const insertingKeys = keys.filter((key) => key in data)
            const query = sql.fragment`
                insert into ${table} (${sql.join(insertingKeys.map((key) => fields[key]), sql.fragment`, `)})
                values (${sql.join(insertingKeys.map((key) => convertToPrimitiveOrSql(key, data[key] ?? null)), sql.fragment`, `)})
                    ${conditionalSql(onConflict, (config) =>
                            config.ignore ? sql.fragment`on conflict do nothing` :
                                    sql.fragment`on conflict (${sql.join(config.fields, sql.fragment`, `)}) do update
                                set ${setExcluded(...config.setExcludedFields)}`
                    )} ${conditionalSql(returning, () => sql.fragment`returning *`)}
            `
            const {
                rows: [entry]
            } = returning
                ? await pool.query(sql.type(entity.guard)`${query}`)
                : await pool.query(sql.unsafe`${query}`);

            assertThat(!returning || entry, new InsertionError(entity, data));

            return entry;
        }
    }