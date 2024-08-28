import type { ZodSchema} from 'zod';

export type EntityValuePrimitive = string | number | boolean | undefined;
export type EntityValue = EntityValuePrimitive | Record<string, unknown> | unknown[] | null;

export type EntityLike<T> = {
    [key in keyof T]: EntityValue;
};

export type Table<T extends EntityLike<T>> = {
    table: string;
    fields: {
        [key in keyof T]: string
    };
};

export type OrderDirection = 'asc' | 'desc';

export type UpdateWhereData<
    SetKey extends EntityLike<SetKey>,
    WhereKey extends EntityLike<WhereKey>> = {
    set: Partial<SetKey>;
    where: Partial<WhereKey>;
    jsonbMode: 'replace' | 'merge'
};

export type Entity<T extends EntityLike<T>, I extends Partial<T>> = {
    tableSingular: string;
    guard: EntityGuard<T>;
    insertGuard: EntityGuard<I>;
} & Table<T>

export type EntityKeys<T extends EntityLike<T>> = Extract<keyof T, string>

export type EntityGuard<T extends EntityLike<T>> = ZodSchema<T>