/**
 * Allows saving and executing a promise later
 */
export class SavedPromise<T> {
    private readonly _accept: (value: T) => void;
    private readonly _reject: (reason?: any) => void;

    public constructor(accept: (value: T) => void, reject: (reason?: any) => void) {
        this._accept = accept;
        this._reject = reject;
    }

    public accept(value: T): void {
        return this._accept(value);
    }

    public reject(reason?: any): void {
        return this._reject(reason);
    }
}