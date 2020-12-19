/**
 * Modified version of XORShift 64 bit PRNG. This is designed more for speed
 * rather than randomness, however it is still more random than the standard
 * Math.random() function and is faster too
 * 
 * Based on XORShift 64 bit Java Implementation at https://jvm-gaming.org/t/random-number-generator/39968
 */
export class Random64 {
    // statically available version of Random64 for quick access
    public static readonly instance: Random64 = new Random64();

    private _seed: number;

    constructor(seed: number = 0) {
        // create the initial seed
        this._seed = seed == 0 ? Math.random() : seed;
    }

    /**
     * Get the next random number
     */
    public next(): number {
        this._seed ^= (this._seed << 13);
        this._seed ^= (this._seed >>> 17);
        this._seed ^= (this._seed << 5);

        return this._seed;
    }

    /**
     * Returns a random number between min and max
     * 
     * @param min 
     * @param max 
     */
    public rand(min: number, max: number): number {
        if (min > max) {
            return this.rand(max, min);
        }

        if (min == max) {
            return min;
        }

        return (this.next() % (max + 1 - min)) + min;
    }
}