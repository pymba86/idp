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