import { SavedPromise } from "./saved-promise";

/**
 * Maintains an array of SavedPromise types that can call accept or reject
 * on all of them.
 */
export class SavedPromiseArray<T> {
    private readonly _queue: Array<SavedPromise<T>>;

    public constructor() {
        this._queue = new Array<SavedPromise<T>>();
    }

    public push(promise: SavedPromise<T> | undefined | null): void {
        if (promise === undefined || promise === null) {
            return;
        }

        this._queue.push(promise);
    }

    public add(accept: (value: T) => void, reject: (reason?: any) => void): void {
        this.push(new SavedPromise<T>(accept, reject));
    }

    /**
     * Flush the internal queue and call accept() on all saved promises
     * 
     * @param value - the value to pass into the accept method
     */
    public accept(value: T): void {
        const queue: Array<SavedPromise<T>> = this._queue;

        // execute any operable types at start of the frame once
        if (queue.length > 0) {
            let newObject: SavedPromise<T> | undefined = queue.pop();

            // loop until the queue is completely empty
            while (newObject) {
                try {
                    newObject.accept(value);
                }
                catch (error) { }

                newObject = queue.pop();
            }
        }
    }

    /**
     * Flush the internal queue and call accept() on all saved promises. If accept()
     * throws an error then reject() will be called with the error.
     * 
     * @param value - the value to pass into the accept method
     */
    public acceptOrReject(value: T): void {
        const queue: Array<SavedPromise<T>> = this._queue;

        // execute any operable types at start of the frame once
        if (queue.length > 0) {
            let newObject: SavedPromise<T> | undefined = queue.pop();

            // loop until the queue is completely empty
            while (newObject) {
                try {
                    newObject.accept(value);
                }
                catch (error) {
                    try {
                        newObject.reject(error);
                    }
                    catch (rError) { }
                }

                newObject = queue.pop();
            }
        }
    }

    /**
     * Flush the internal queue and call reject() on all saved promises
     *
     * @param reason - the value to pass into the reject method
     */
    public reject(reason?: any): void {
        const queue: Array<SavedPromise<T>> = this._queue;

        // execute any operable types at start of the frame once
        if (queue.length > 0) {
            let newObject: SavedPromise<T> | undefined = queue.pop();

            // loop until the queue is completely empty
            while (newObject) {
                try {
                    newObject.reject(reason);
                }
                catch (error) { }

                newObject = queue.pop();
            }
        }
    }

    /**
     * The number of saved promises in the queue
     */
    public get length(): number {
        return this._queue.length;
    }
}