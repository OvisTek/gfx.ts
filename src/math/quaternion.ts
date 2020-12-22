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
 * much nicer to interpolate.
 * 
 * Some functions implemented/ported from https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/math/Quaternion.java
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
     * Get the pitch euler angle in radians, which is the rotation around the x axis between -PI/2 and +PI/2
     * Requires that this Quaternion is normalised
     */
    public get pitchRad(): number {
        const pole: number = this.gimbalPole;
        const qx: number = this._x;
        const qy: number = this._y;
        const qz: number = this._z;
        const qw: number = this._w;

        return pole == 0 ?
            Math.asin(MathUtil.clamp(2.0 * (qw * qx - qz * qy), -1.0, 1.0)) :
            pole * Math.PI * 0.5;
    }

    /**
     * Get the yaw euler angle in radians, which is the rotation around the y axis between -PI and +PI
     * Requires that this Quaternion is normalised
     */
    public get yawRad(): number {
        const pole: number = this.gimbalPole;
        const qx: number = this._x;
        const qy: number = this._y;
        const qz: number = this._z;
        const qw: number = this._w;

        return pole == 0 ?
            Math.atan2(2.0 * (qy * qw + qx * qz), 1.0 - 2.0 * (qy * qy + qx * qx)) :
            0.0;
    }

    /**
     * Get the roll euler angle in degrees, which is the rotation around the z axis between -180 and +180
     * Requires that this Quaternion is normalised
     */
    public get roll(): number {
        return this.rollRad * MathUtil.RADTDEG;
    }

    /**
     * Get the pitch euler angle in degrees, which is the rotation around the x axis between -90 and +90
     * Requires that this Quaternion is normalised
     */
    public get pitch(): number {
        return this.pitchRad * MathUtil.RADTDEG;
    }

    /**
     * Get the yaw euler angle in degrees, which is the rotation around the y axis between -180 and +180
     * Requires that this Quaternion is normalised
     */
    public get yaw(): number {
        return this.yawRad * MathUtil.RADTDEG;
    }

    /**
     * Provided x, y, z, w components, multiply it with this Quaternion and return the results.
     * 
     * Optionally stores result in result Quaternion. If a result Quaternion is not provided,
     * this Quaternion will be modified
     * 
     * @param x Multiply with this Quaternion.x
     * @param y Multiply with this Quaternion.y
     * @param z Multiply with this Quaternion.z
     * @param w Multiply with this Quaternion.w
     * @param optres (optional) The result to store in
     */
    public multiply(x: number, y: number, z: number, w: number, optres: Quaternion | undefined = undefined): Quaternion {
        const result: Quaternion = optres || this;

        const qx: number = this._x;
        const qy: number = this._y;
        const qz: number = this._z;
        const qw: number = this._w;

        result.x = qw * x + qx * w + qy * z - qz * y;
        result.y = qw * y + qy * w + qz * x - qx * z;
        result.z = qw * z + qz * w + qx * y - qy * x;
        result.w = qw * w - qx * x - qy * y - qz * z;

        return result;
    }

    /**
     * Provided a scalar component, multiply it with this Quaternion and return the results.
     * 
     * Optionally stores result in result Quaternion. If a result Quaternion is not provided,
     * this Quaternion will be modified
     * 
     * @param scalar Multiply with this Quaternion x, y, z and w components
     * @param optres (optional) The result to store in
     */
    public multiplyScalar(scalar: number, optres: Quaternion | undefined = undefined): Quaternion {
        const result: Quaternion = optres || this;

        result.x = this._x * scalar;
        result.y = this._y * scalar;
        result.z = this._z * scalar;
        result.w = this._w * scalar;

        return result;
    }

    /**
     * Provided a Quaternion, multiply it with this Quaternion and return the results.
     * 
     * Optionally stores result in result Quaternion. If a result Quaternion is not provided,
     * this Quaternion will be modified
     * 
     * @param quat The Quaternion to multiply with this Quaternion
     * @param optres (optional) The result to store in
     */
    public multiplyQuaternion(quat: Quaternion, optres: Quaternion | undefined = undefined): Quaternion {
        return this.multiply(quat._x, quat._y, quat._z, quat._w, optres);
    }

    /**
     * Spherical Linear Interpolation between this Quaternion and End based on Alpha value between [0, 1]
     * 
     * Optionally stores result in result Quaternion. If a result Quaternion is not provided,
     * this Quaternion will be modified
     * 
     * @param end The Quaternion to interpolate towards
     * @param alpha The alpha value between [0, 1]
     * @param optres (optional) The result to store in
     */
    public slerp(end: Quaternion, alpha: number = 1.0, optres: Quaternion | undefined = undefined): Quaternion {
        const result: Quaternion = optres || this;

        // ensure alpha is clamped between 0 and 1
        alpha = MathUtil.clamp(alpha, 0, 1);

        const d: number = this._x * end._x + this._y * end._y + this._z * end._z + this._w * end._w;
        const absDot: number = d < 0.0 ? -d : d;

        // Set the first and second scale for the interpolation
        let scale0: number = 1.0 - alpha;
        let scale1: number = alpha;

        // Check if the angle between the 2 quaternions was big enough to
        // warrant such calculations
        if ((1.0 - absDot) > 0.1) {// Get the angle between the 2 quaternions,
            // and then store the sin() of that angle
            const angle: number = Math.acos(absDot);
            const invSinTheta: number = 1.0 / Math.sin(angle);

            // Calculate the scale for q1 and q2, according to the angle and
            // it's sine value
            scale0 = Math.sin((1.0 - alpha) * angle) * invSinTheta;
            scale1 = Math.sin((alpha * angle)) * invSinTheta;
        }

        if (d < 0.0) {
            scale1 = -scale1;
        }

        // Calculate the x, y, z and w values for the quaternion by using a
        // special form of linear interpolation for quaternions.
        result.x = (scale0 * this._x) + (scale1 * end.x);
        result.y = (scale0 * this._y) + (scale1 * end.y);
        result.z = (scale0 * this._z) + (scale1 * end.z);
        result.w = (scale0 * this._w) + (scale1 * end.w);

        return result;
    }
}