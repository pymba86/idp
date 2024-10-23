import delay from "delay";

export const resolveWithinExpireIn = async (promise: Promise<any>, expireIn: number) => {

    const timeout = Math.max(1, expireIn) * 1000;

    const timeoutReject = delay.reject(timeout,
        {value: new Error(`handler execution exceeded ${expireIn}ms`)});

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