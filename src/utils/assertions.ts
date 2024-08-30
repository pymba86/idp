import {Truthy} from "../types/index.js";

const compareFunction = <T extends string | boolean | number>(a: T, b: T) => {
    if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
    }

    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }

    if (typeof a === 'boolean' && typeof b === 'boolean') {
        return Number(a) - Number(b);
    }

    throw new Error('Unsupported compare type');
};


export const isSameArray = <T extends string | boolean | number>(
    array1: T[],
    array2: T[]
): boolean => {
    if (array1.length !== array2.length) {
        return false;
    }

    const sortedA = array1.slice().sort(compareFunction);
    const sortedB = array2.slice().sort(compareFunction);

    return sortedA.every((value, index) => value === sortedB[index]);
};

export const notFalsy = <T>(value: T): value is Truthy<T> => Boolean(value);

export const notEmpty = <T>(value: T): value is NonNullable<T> =>
    value !== null && value !== undefined;

export const has = (data: unknown, property: string) =>
    Object.prototype.hasOwnProperty.call(data, property);