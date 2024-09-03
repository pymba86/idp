import {notFalsy} from "./assertions.js";
import {Falsy, Nullable, Optional, Truthy} from "../types/index.js";

export const nullable = <T>(exp: T): Nullable<Truthy<T>> => (notFalsy(exp) ? exp : null);

export const conditional = <T>(exp: T): Optional<Truthy<T>> => (notFalsy(exp) ? exp : undefined);

export const conditionalString = <T>(exp: T): string => (notFalsy(exp) ? String(exp) : '');

export const conditionalArray = <T>(
    ...exps: Readonly<Array<T | Falsy>>
): Array<T extends Readonly<Array<infer InnerArray>> ? InnerArray : T> =>
    exps.filter((value): value is Exclude<typeof value, Falsy> => notFalsy(value)).flat();

export type TruthyObject<T extends Record<string, unknown>> = {
    // Directly remove the key if the type is falsy.
    [K in keyof T as T[K] extends Falsy ? never : K]: [T[K] & Falsy] extends [never]
        ? // No intersection with falsy types, keep the type.
        T[K]
        : // If the type could be falsy, make it optional.
        Optional<Truthy<T[K]>>;
};

export const conditionalObject = <T extends Record<string, unknown>>(object: T): TruthyObject<T> =>
    // eslint-disable-next-line no-restricted-syntax
    Object.fromEntries(
        Object.entries(object).filter(([, value]) => notFalsy(value))
    ) as TruthyObject<T>;