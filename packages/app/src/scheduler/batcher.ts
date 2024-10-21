export type Item<T> = T

export type OnFlushFn<T> = (batch: Array<Item<T>>) => Promise<void>;

export type BatcherConfig<T> = {
    /**
     * Function which called during flush
     * If an array is returned with id and data, it will try to resolve the promises with its data.
     * This is useful when doing querying
     */
    onFlush: OnFlushFn<T>;
    /**
     * Max targeted size
     */
    maxSize: number;
    /**
     * Max duration before the batch is flushed
     */
    maxTimeInMs: number;
    /**
     * Minimal time for a flush to happen after the first item is added
     */
    minTimeInMs?: number;
};

class FlushBatch {
    public readonly promise: Promise<unknown>;

    private _isSettled: boolean = false;
    private _timeout: NodeJS.Timeout | null = null;
    private _resolve: ((value: void | PromiseLike<void>) => void) | null = null;

    constructor(flushPromise: () => Promise<unknown>, timeToFlush: number) {
        this.promise =
            timeToFlush > 0
                ? new Promise<void>((resolve) => {
                    this._resolve = resolve;
                    this._timeout = setTimeout(this._resolve.bind(this), timeToFlush);
                }).then(flushPromise)
                : flushPromise();
    }

    public settle() {
        /* istanbul ignore next */
        if (this._isSettled) {
            return;
        }

        this._isSettled = true;

        if (this._timeout) {
            clearTimeout(this._timeout);
        }

        if (this._resolve) {
            this._resolve();
        }
    }
}

export function createBatcher<T>(props: BatcherConfig<T>) {
    const { onFlush, maxSize, maxTimeInMs, minTimeInMs = 0 } = props;

    const dataArray: Array<Item<T>> = [];

    let batchTimeout: NodeJS.Timeout | null = null;

    const pendingFlushes = new Set<FlushBatch>();

    function _flush() {

        if (dataArray.length === 0) {
            return Promise.resolve([]);
        }

        const itemsToFlush = [...dataArray];

        dataArray.length = 0;

        const flushItem = new FlushBatch(() => onFlush(itemsToFlush), minTimeInMs);

        pendingFlushes.add(flushItem);

        // catch and remove when complete
        flushItem.promise
            .catch(() => {})
            .finally(() => {
                // clean up
                pendingFlushes.delete(flushItem);
            });

        return flushItem.promise;
    }

    function add(data: T): void {

        dataArray.push(data);

        if (dataArray.length >= maxSize) {
            batchTimeout && clearTimeout(batchTimeout);
            _flush();
        }

        // first item, schedule a delay of maxTime and after flush
        if (dataArray.length === 1) {
            // in background start flushing
            batchTimeout = setTimeout(_flush, maxTimeInMs);
        }
    }

    return {
        add,
        async waitForAll() {
            // clear the latest flush
            batchTimeout && clearTimeout(batchTimeout);
            _flush();

            // wait for all promises to complete
            await Promise.all(
                Array.from(pendingFlushes).map((f) => {
                    f.settle();
                    return f.promise;
                })
            );
        },
    };
}