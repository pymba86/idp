export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type PlainObject = Record<string | number | symbol, unknown>;

export type ValuesOf<T extends unknown[]> = T[number];

export type Picked<T extends PlainObject, Keys extends Array<keyof T>> = {
    [key in ValuesOf<Keys>]: T[key];
};

export type Falsy = '' | 0 | false | null | undefined;

export type Truthy<T> = Exclude<T, Falsy>;

type JoinKeys<K1, K2> = `${K1 & string}.${K2 & string}`;

type JoinKeysExcludingArrayKey<K1, K2> = JoinKeys<K1, Exclude<K2, keyof any[]>>;

type NormalizeKeyPathsRecursively<T, K = keyof T> = K extends keyof T
    ? T[K] extends Record<string, any>
        ? T[K] extends readonly any[]
            ?
            | JoinKeysExcludingArrayKey<K, keyof T[K]>
            | JoinKeysExcludingArrayKey<K, NormalizeKeyPathsRecursively<T[K]>>
            : JoinKeys<K, keyof T[K]> | JoinKeys<K, NormalizeKeyPathsRecursively<T[K]>>
        : never
    : never;

export type NormalizeKeyPaths<T> = keyof T | NormalizeKeyPathsRecursively<T>;

export type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

export type SnakeCase<S extends string> = S extends `${infer P1}${infer P2}${infer P3}`
    ? `${P1}${P2 extends Uppercase<P2> ? '_' : ''}${Lowercase<P2>}${SnakeCase<P3>}`
    : Lowercase<S>;

export type KeysToCamelCase<T> = {
    [K in keyof T as CamelCase<string & K>]: T[K] extends Record<string, unknown>
        ? KeysToCamelCase<T[K]>
        : T[K];
};

export type DeepPartial<T> =
    T extends Record<string | number | symbol, unknown>
        ? {
            [P in keyof T]?: DeepPartial<T[P]>;
        }
        : T;