/**
 * Contains commonly used variables and properties for math operations
 */
export class MathUtil {
    /** Multiply to convert radians to degrees */
    public static readonly RADTDEG: number = 180.0 / Math.PI;
    /** Multiply to convert from degrees to radians */
    public static readonly DEGTRAD: number = Math.PI / 180.0;

    // used internally for some bit-shift operations
    private static readonly INT8 = new Int8Array(4);
    private static readonly INT32 = new Int32Array(MathUtil.INT8.buffer, 0, 1);
    private static readonly FLOAT32 = new Float32Array(MathUtil.INT8.buffer, 0, 1);

    /**
     * Clamps a number between min and max
     * @param value The value to clamp
     * @param min The minimum value to clamp to
     * @param max The maximum value to clamp to
     */
    public static clamp(value: number, min: number, max: number): number {
        if (value < min) { return min };
        if (value > max) { return max };

        return value;
    }

    /**
     * Convert a provided number into its integer bit representation
     * This is useful for certain hashing operations
     * 
     * @param value The value to convert
     */
    public static floatToIntBits(value: number): number {
        MathUtil.FLOAT32[0] = value;

        return MathUtil.INT32[0];
    }
}