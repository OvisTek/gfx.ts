import { QuaternionRO } from "./quaternion-ro";

/**
 * Interface for serialising and deserialising Quaternion structure
 * for storage/database purposes
 */
export interface QuaternionJson {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
}

/**
 * Quaternions are used to represent rotations in 3D space
 * 
 * Unlike Eular Angles, Quaternions do not suffer from gimbal lock problems and are
 * much nicer to interpolate
 */
export class Quaternion {
    // static members - read-only and cannot be modified
    public static readonly IDENTITY: Quaternion = new QuaternionRO(0, 0, 0, 1);
    public static readonly ZERO: Quaternion = new QuaternionRO(0, 0, 0, 0);

    private _x: number;
    private _y: number;
    private _z: number;
    private _w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
    }

    /**
     * Serialise this Quaternion for storage/database purposes
     * See QuaternionJson Interface for details
     */
    public serialise(): QuaternionJson {
        return {
            x: this._x,
            y: this._y,
            z: this._z,
            w: this._w
        }
    }

    /**
     * Deserialise a previously serialised version of a Quaternion
     * 
     * @param values The serialised Quaternion to deserialise
     */
    public static deserialise(values: QuaternionJson): Quaternion {
        return new Quaternion().deserialise(values);
    }

    /**
     * Deserialise a previously serialised version of a Quaternion
     *
     * @param values The serialised Quaternion to deserialise
     */
    public deserialise(values: QuaternionJson): Quaternion {
        return this.set(values.x, values.y, values.z, values.w);
    }

    public get x(): number { return this._x; }
    public set x(value: number) { this._x = value; }

    public get y(): number { return this._y; }
    public set y(value: number) { this._y = value; }

    public get z(): number { return this._z; }
    public set z(value: number) { this._z = value; }

    public get w(): number { return this._w; }
    public set w(value: number) { this._w = value; }

    /**
     * @param x X component to set
     * @param y Y component to set
     * @param z Z component to set
     * @param w W component to set
     */
    public set(x: number, y: number, z: number, w: number): Quaternion {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;

        return this;
    }
}