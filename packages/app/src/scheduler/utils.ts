import delay from "delay";

export const resolveWithinExpireIn = async (promise: Promise<any>, seconds: number) => {

    const timeout = Math.max(1, seconds) * 1000;

    const timeoutReject = delay.reject(timeout,
        {value: new Error(`handler execution exceeded ${timeout}ms`)});

    let result;

    try {
        result = await Promise.race([promise, timeoutReject]);
    } finally {
        try {
            timeoutReject.clear();
        } catch {
        }
    }

    return result;
};