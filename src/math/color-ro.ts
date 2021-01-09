import { Color } from "./color";

/**
 * Read-Only variant of Color, does not allow modifying initial internal state
 */
export class ColorRO extends Color {
    constructor(red: number = 0, green: number = 0, blue: number = 0, alpha: number = 0) {
        super(red, green, blue, alpha);
    }

    public set r(value: number) {
        throw new Error("set Color.r - cannot modify property as Color is read-only");
    }

    public set g(value: number) {
        throw new Error("set Color.g - cannot modify property as Color is read-only");
    }

    public set b(value: number) {
        throw new Error("set Color.b - cannot modify property as Color is read-only");
    }

    public set a(value: number) {
        throw new Error("set Color.a - cannot modify property as Color is read-only");
    }
}