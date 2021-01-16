/**
 * Used for generating a unique ID for objects. This can be swapped for
 * generating UUID however this is not required as JavaScript only runs
 * on a single thread.
 * 
 * This ensures the internal counter will never clash
 */
export class GlobalID {
    private static _counter: number = 0;

    /**
     * Generates and returns a new ID as number
     */
    public static generate(): number {
        return this._counter++;
    }
}