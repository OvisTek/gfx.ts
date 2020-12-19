import { Vector3RO } from "./vector3ro";

/**
 * 3 component (x, y, z) Vector3
 */
export class Vector3 {
    // static members - read-only and cannot be modified
    public static readonly Zero: Vector3 = new Vector3RO(0, 0, 0);
    public static readonly X: Vector3 = new Vector3RO(1, 0, 0);
    public static readonly Y: Vector3 = new Vector3RO(0, 1, 0);
    public static readonly Z: Vector3 = new Vector3RO(0, 0, 1);

    // Vector3 components
    private _x: number;
    private _y: number;
    private _z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this._x = x;
        this._y = y;
        this._z = z;
    }

    public get x(): number { return this._x; }
    public set x(value: number) { this._x = value; }

    public get y(): number { return this._y; }
    public set y(value: number) { this._y = value; }

    public get z(): number { return this._z; }
    public set z(value: number) { this._z = value; }

    /**
     * @param x X component to set
     * @param y Y component to set
     * @param z Z component to set
     */
    public set(x: number, y: number, z: number): Vector3 {
        this.x = x;
        this.y = y;
        this.z = z;

        return this;
    }

    /**
     * Copies the components of the provided array into the provided Vector3
     * 
     * @param values The values to copy
     */
    public fromArray(values: number[]): Vector3 {
        if (values.length < 3) {
            throw new Error("Vector3.fromArray(number[]) - provided argument length must be >= 3");
        }

        this.x = values[0];
        this.y = values[1];
        this.z = values[2];

        return this;
    }

    /**
     * Copies an existing Vector3 into this Vector3
     * 
     * @param matrix The Vector3 to copy
     */
    public copy(vector: Vector3): Vector3 {
        this.x = vector._x;
        this.y = vector._y;
        this.z = vector._z;

        return this;
    }

    /**
     * Clones the current Vector3 and returns a new instance
     */
    public clone(): Vector3 {
        return new Vector3().copy(this);
    }

    /**
     * Converts this Matrix into the Identity Matrix
     */
    public zero(): Vector3 {
        this.x = 0;
        this.y = 0;
        this.z = 0;

        return this;
    }

    /**
     * Provided x, y, z components, add it to this Vector and return the results.
     * 
     * Optionally stores result in result Vector. If a result vector is not provided,
     * this vector will be modified
     * 
     * @param x Add to this Vector.x
     * @param y Add to this Vector.y
     * @param z Add to this Vector.z
     * @param optres (optional) The result to store in
     */
    public add(x: number, y: number, z: number, optres: Vector3 | undefined): Vector3 {
        const result: Vector3 = optres || this;

        result.x += x;
        result.y += y;
        result.z += z;

        return result;
    }

    /**
     * Provided another Vector, add it to this Vector and return the results.
     * 
     * Optionally stores result in result Vector. If a result vector is not provided,
     * this vector will be modified
     * 
     * @param other The Vector to add to this Vector
     * @param optres (optional) The result to store in
     */
    public addVector(other: Vector3, optres: Vector3 | undefined): Vector3 {
        return this.add(other._x, other._y, other._z, optres);
    }

    /**
     * Provided another Scalar value, add it to this Vector and return the results.
     *
     * Optionally stores result in result Vector. If a result vector is not provided,
     * this vector will be modified
     *
     * @param other The Scalar value to add to each component of this Vector
     * @param optres (optional) The result to store in
     */
    public addScalar(other: number, optres: Vector3 | undefined): Vector3 {
        return this.add(other, other, other, optres);
    }
}