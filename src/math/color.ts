import { ColorRO } from "./color-ro";
import { MathUtil } from "./math-util";

/**
 * Represents 32 bit RGBA Color
 * Components range from 0 to 1
 */
export class Color {
    // easy access static read-only colors for convenience
    public static readonly CLEAR: Color = new ColorRO(0, 0, 0, 0);
    public static readonly BLACK: Color = new ColorRO(0, 0, 0, 1);
    public static readonly WHITE: Color = new ColorRO(1, 1, 1, 1);
    public static readonly RED: Color = new ColorRO(1, 0, 0, 1);
    public static readonly GREEN: Color = new ColorRO(0, 1, 0, 1);
    public static readonly BLUE: Color = new ColorRO(0, 0, 1, 1);

    // color components
    private _r: number;
    private _g: number;
    private _b: number;
    private _a: number;

    constructor(red: number = 0, green: number = 0, blue: number = 0, alpha: number = 0) {
        this._r = red;
        this._g = green;
        this._b = blue;
        this._a = alpha;
    }

    /**
     * RED Component of this Color between 0 and 1
     */
    public get r(): number {
        return this._r;
    }

    public set r(value: number) {
        this._r = value;
    }

    /**
     * Clamped RED Component of this Color between 0 and 255
     */
    public get red(): number {
        return MathUtil.clamp(this._r * 255, 0, 255);
    }

    public set red(value: number) {
        this.r = MathUtil.clamp(value / 255, 0, 1);
    }

    /**
     * GREEN Component of this Color between 0 and 1
     */
    public get g(): number {
        return this._g;
    }

    public set g(value: number) {
        this._g = value;
    }

    /**
     * Clamped GREEN Component of this Color between 0 and 255
     */
    public get green(): number {
        return MathUtil.clamp(this._g * 255, 0, 255);
    }

    public set green(value: number) {
        this.g = MathUtil.clamp(value / 255, 0, 1);
    }

    /**
     * BLUE Component of this Color between 0 and 1
     */
    public get b(): number {
        return this._b;
    }

    public set b(value: number) {
        this._b = value;
    }

    /**
     * Clamped BLUE Component of this Color between 0 and 255
     */
    public get blue(): number {
        return MathUtil.clamp(this._b * 255, 0, 255);
    }

    public set blue(value: number) {
        this.b = MathUtil.clamp(value / 255, 0, 1);
    }

    /**
     * ALPHA Component of this Color between 0 and 1
     */
    public get a(): number {
        return this._a;
    }

    public set a(value: number) {
        this._a = value;
    }

    /**
     * Clamped ALPHA Component of this Color between 0 and 255
     */
    public get alpha(): number {
        return MathUtil.clamp(this._a * 255, 0, 255);
    }

    public set alpha(value: number) {
        this.a = MathUtil.clamp(value / 255, 0, 1);
    }
}