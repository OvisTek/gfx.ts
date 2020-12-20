import { MathUtil } from "./math-util";
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

    /**
     * Copies the components of the provided array into the provided Quaternion
     * 
     * @param values The values to copy
     */
    public fromArray(values: number[]): Quaternion {
        if (values.length < 4) {
            throw new Error("Quaternion.fromArray(number[]) - provided argument length must be >= 4");
        }

        this.x = values[0];
        this.y = values[1];
        this.z = values[2];
        this.w = values[3];

        return this;
    }

    /**
     * Copies an existing Quaternion into this Quaternion
     * 
     * @param matrix The Quaternion to copy
     */
    public copy(quat: Quaternion): Quaternion {
        this.x = quat._x;
        this.y = quat._y;
        this.z = quat._z;
        this.w = quat._w;

        return this;
    }

    /**
     * Clones the current Quaternion and returns a new instance
     */
    public clone(): Quaternion {
        return new Quaternion().copy(this);
    }

    /**
     * Calculate the euclidean length of this Quaternion
     */
    public get length(): number {
        return Math.sqrt(this.lengthSq);
    }

    /**
     * Calculate the squared euclidean length of this Quaternion
     * 
     * this operation is cheaper than .length() as it omits a Math.sqrt()
     */
    public get lengthSq(): number {
        return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
    }

    /**
     * Sets the Quaternion to the given euler angles in degrees.
     *
     * @param yaw the rotation around the y axis in degrees
     * @param pitch the rotation around the x axis in degrees
     * @param roll the rotation around the z axis in degrees
     */
    public setEuler(yawDeg: number, pitchDeg: number, rollDeg: number): Quaternion {
        const dr: number = MathUtil.DEGTRAD;

        return this.setEulerRad(yawDeg * dr, pitchDeg * dr, rollDeg * dr);
    }

    /** 
     * Sets the Quaternion to the given euler angles in radians.
     * 
     * @param yaw the rotation around the y axis in radians
     * @param pitch the rotation around the x axis in radians
     * @param roll the rotation around the z axis in radians
     */
    public setEulerRad(yawRad: number, pitchRad: number, rollRad: number): Quaternion {
        const hr: number = rollRad * 0.5;
        const shr: number = Math.sin(hr);
        const chr: number = Math.cos(hr);

        const hp: number = pitchRad * 0.5;
        const shp: number = Math.sin(hp);
        const chp: number = Math.cos(hp);

        const hy: number = yawRad * 0.5;
        const shy: number = Math.sin(hy);
        const chy: number = Math.cos(hy);

        const chy_shp: number = chy * shp;
        const shy_chp: number = shy * chp;
        const chy_chp: number = chy * chp;
        const shy_shp: number = shy * shp;

        this.x = (chy_shp * chr) + (shy_chp * shr);
        this.y = (shy_chp * chr) - (chy_shp * shr);
        this.z = (chy_chp * shr) - (shy_shp * chr);
        this.w = (chy_chp * chr) + (shy_shp * shr);

        return this;
    }

    /**
     * Sets this Quaternion to an identity Quaternion
     */
    public identity(): Quaternion {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;

        return this;
    }

    /**
     * Normalise this Quaternion so its length == 1
     */
    public normalise(): Quaternion {
        const lenSq: number = this.lengthSq;

        if (lenSq == 0 || lenSq == 1) {
            return this;
        }

        const len: number = Math.sqrt(lenSq);

        this.w /= len;
        this.x /= len;
        this.y /= len;
        this.z /= len;

        return this;
    }

    /**
     * Conjugate this Quaternion aka negate x, y and z components
     */
    public conjugate(): Quaternion {
        this.x = -this._x;
        this.y = -this._y;
        this.z = -this._z;

        return this;
    }

    /**
     * Get the pole of the gimbal lock if any
     */
    public get gimbalPole(): number {
        const t: number = this._y * this._x + this._z * this._w;

        return t > 0.499 ? 1 : (t < -0.499 ? -1 : 0);
    }

    /**
     * Get the roll euler angle in radians, which is the rotation around the z axis between -PI and +PI
     * Requires that this Quaternion is normalised
     */
    public get rollRad(): number {
        const pole: number = this.gimbalPole;
        const qx: number = this._x;
        const qy: number = this._y;
        const qz: number = this._z;
        const qw: number = this._w;

        return pole == 0 ?
            Math.atan2(2.0 * (qw * qz + qy * qx), 1.0 - 2.0 * (qx * qx + qz * qz)) :
            pole * 2.0 * Math.atan2(qy, qw);
    }

    /**
     * Get the roll euler angle in degrees, which is the rotation around the z axis between -180 and +180
     * Requires that this Quaternion is normalised
     */
    public get roll(): number {
        return this.rollRad * MathUtil.RADTDEG;
    }
}