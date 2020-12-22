import { MathUtil } from "./math-util";
import { Quaternion } from "./quaternion";

/**
 * Stores Euler Rotations in 3D space as radians
 */
export class Euler {

    // rotation in radians around the y axis
    private _yaw: number;
    // rotation in radians around the x axis
    private _pitch: number;
    // rotation in radians around the z axis
    private _roll: number;

    constructor(yaw: number = 0, pitch: number = 0, roll: number = 0) {
        this._yaw = yaw;
        this._pitch = pitch;
        this._roll = roll;
    }

    /**
     * Yaw in radians representing rotation around the y axis
     */
    public get yaw(): number {
        return this._yaw;
    }

    /**
     * Set Yaw in radians representing rotation around the y axis
     */
    public set yaw(value: number) {
        this._yaw = value;
    }

    /**
     * Pitch in radians representing rotation around the x axis
     */
    public get pitch(): number {
        return this._pitch;
    }

    /**
     * Set Pitch in radians representing rotation around the x axis
     */
    public set pitch(value: number) {
        this._pitch = value;
    }

    /**
     * Roll in radians representing rotation around the z axis
     */
    public get roll(): number {
        return this._roll;
    }

    /**
     * Set Roll in radians representing rotation around the z axis
     */
    public set roll(value: number) {
        this._roll = value;
    }

    /**
     * Yaw in degrees representing rotation around the y axis
     */
    public get yawDeg(): number {
        return this._yaw * MathUtil.RADTDEG;
    }

    /**
     * Set Yaw in degrees representing rotation around the y axis
     */
    public set yawDeg(value: number) {
        this._yaw = value * MathUtil.DEGTRAD;
    }

    /**
     * Pitch in degrees representing rotation around the x axis
     */
    public get pitchDeg(): number {
        return this._pitch * MathUtil.RADTDEG;
    }

    /**
     * Set Pitch in degrees representing rotation around the x axis
     */
    public set pitchDeg(value: number) {
        this._pitch = value * MathUtil.DEGTRAD;
    }

    /**
     * Roll in degrees representing rotation around the z axis
     */
    public get rollDeg(): number {
        return this._roll * MathUtil.RADTDEG;
    }

    /**
     * Set Roll in degrees representing rotation around the z axis
     */
    public set rollDeg(value: number) {
        this._roll = value * MathUtil.DEGTRAD;
    }

    /**
     * Rotation around the y axis represented as radians
     */
    public get y(): number {
        return this._yaw;
    }

    /**
     * Set Rotation around the y axis represented as radians
     */
    public set y(value: number) {
        this._yaw = value;
    }

    /**
     * Rotation around the x axis represented as radians
     */
    public get x(): number {
        return this._pitch;
    }

    /**
     * Set Rotation around the x axis represented as radians
     */
    public set x(value: number) {
        this._pitch = value;
    }

    /**
     * Rotation around the z axis represented as radians
     */
    public get z(): number {
        return this._roll;
    }

    /**
     * Set Rotation around the z axis represented as radians
     */
    public set z(value: number) {
        this._roll = value;
    }

    /**
     * Sets the rotation for this Euler rotation in radians
     * 
     * @param yaw Rotation in y axis as radians
     * @param pitch Rotation in x axis as radians
     * @param roll Rotation in z axis as radians
     */
    public set(yaw: number, pitch: number, roll: number): Euler {
        this.yaw = yaw;
        this.pitch = pitch;
        this.roll = roll;

        return this;
    }

    /**
     * Sets the rotation for this Euler rotation in degrees
     * 
     * @param yaw Rotation in y axis as degrees
     * @param pitch Rotation in x axis as degrees
     * @param roll Rotation in z axis as degrees
     */
    public setDegrees(yaw: number, pitch: number, roll: number): Euler {
        this.yawDeg = yaw;
        this.pitchDeg = pitch;
        this.rollDeg = roll;

        return this;
    }

    /**
     * Sets the rotation from the provided quaternion
     * 
     * @param quat The Quaternion to use for setting this rotation
     */
    public setQuaternion(quat: Quaternion): Euler {
        return quat.euler(this);
    }

    /**
     * Converts this Euler rotation into a Quaternion
     * 
     * Optionally stores result in result Quaternion. If a result Quaternion is not provided,
     * a new instance will be created
     *
     * @param quat (optional) The result to store in. If missing, new instance will be created
     */
    public quaternion(quat: Quaternion | undefined = undefined): Quaternion {
        const result = quat || new Quaternion();

        result.setEuler(this);

        return result;
    }
}