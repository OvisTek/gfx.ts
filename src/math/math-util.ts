/**
 * Contains commonly used variables and properties for math operations
 */
export class MathUtil {
    /** Multiply to convert radians to degrees */
    public static readonly RADTDEG: number = 180.0 / Math.PI;
    /** Multiply to convert from degrees to radians */
    public static readonly DEGTRAD: number = Math.PI / 180.0;

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
}