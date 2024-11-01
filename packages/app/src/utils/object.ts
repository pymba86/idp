
export const isObject = (object: unknown): object is object =>
    object !== null && typeof object === 'object';

type RemoveUndefinedKeys<T> = {
    [Key in keyof T as T[Key] extends undefined ? never : Key]: Exclude<T[Key], undefined>;
};

export const removeUndefinedKeys = <T extends object>(object: T): RemoveUndefinedKeys<T> =>
    Object.fromEntries(
        Object.entries(object).filter(([, value]) => value !== undefined)
    ) as RemoveUndefinedKeys<T>;