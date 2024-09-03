export const pick = <T, Keys extends Array<keyof T>>(
    object: T,
    ...keys: Keys
): { [key in Keys[number]]: T[key] } => {
    return Object.fromEntries(keys.map((key) => [key, object[key]])) as {
        [key in Keys[number]]: T[key];
    };
};