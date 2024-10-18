import delay, {ClearablePromise} from "delay";

export type Worker = {
    notify: () => void;
    start: () => void;
    stop: () => Promise<void>;
};

type ShouldContinue = boolean | void | undefined;

export function createWorker(
    run: () => Promise<ShouldContinue>,
    options: {loopInterval: number}
): Worker {
    const {loopInterval} = options;

    let loopPromise: Promise<any>;
    let loopDelayPromise: ClearablePromise<void> | null = null;

    const state = {
        running: false,
        notified: false,
    };

    async function loop() {
        while (state.running) {
            const started = Date.now();
            const shouldContinue = await run();
            const duration = Date.now() - started;

            if (state.running) {
                // do alteast 5 ms for non-blocking loop

                const delayDuration = Math.max(
                    shouldContinue
                    || state.notified ? 5 : loopInterval - duration, 5);

                loopDelayPromise = delay(delayDuration);
                await loopDelayPromise;
            }

            // clean up
            loopDelayPromise = null;
            state.notified = false;
        }
    }

    function notify() {
        // does not make sense to notify when not running
        if (!state.running) {
            return;
        }

        state.notified = true;
        if (loopDelayPromise) {
            loopDelayPromise.clear();
        }
    }

    function start() {
        if (state.running) {
            return;
        }
        state.running = true;
        loopPromise = loop()
    }

    async function stop() {
        if (!state.running) {
            return;
        }

        state.running = false;
        setImmediate(() => loopDelayPromise?.clear());

        await loopPromise;
    }

    return {
        start,
        stop,
        notify
    }
}