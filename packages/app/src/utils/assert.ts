export type AssertFunction = <E extends Error>(value: unknown, error: E) => asserts value;

export const assert: AssertFunction = (value, error): asserts value => {
    if (!value) {
        throw error;
    }
};
