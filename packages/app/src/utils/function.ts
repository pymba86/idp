export type TryThat = {
    <T, E extends Error>(exec: () => T, onError: (error: unknown) => E): T;
};

export const tryThat: TryThat = (exec, onError) => {
    try {
        return exec()
    } catch (error) {
        throw onError(error);
    }
};

export type TrySafe = {
    <T, E extends Error>(exec: () => T, onError?: (error: unknown) => E): T | undefined;
};

export const trySafe: TrySafe = (exec, onError) => {
    try {
        return exec()
    } catch (error) {
        onError?.(error);
    }
    return undefined
};