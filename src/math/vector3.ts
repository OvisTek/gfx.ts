import { Vector3RO } from "./vector3-ro";

/**
 * Interface for serialising and deserialising Vector3 structure
 * for storage/database purposes
 */
export interface Vector3Json {
    readonly x: number;
    readonly y: number;
    readonly z: number;
}

/**
 * 3 component (x, y, z) Vector3
 */
export class Vector3 {
    // static members - read-only and cannot be modified
    public static readonly ZERO: Vector3 = new Vector3RO(0, 0, 0);
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

    /**
     * Serialise this Vector3 for storage/database purposes
     * See Vector3Json Interface for details
     */
    public serialise(): Vector3Json {
        return {
            x: this._x,
            y: this._y,
            z: this._z
        }
    }

    /**
     * Deserialise a previously serialised version of a Vector3
     * 
     * @param values The serialised Vector3 to deserialise
     */
    public static deserialise(values: Vector3Json): Vector3 {
        return new Vector3().deserialise(values);
    }

    /**
     * Deserialise a previously serialised version of a Vector3
     *
     * @param values The serialised Vector3 to deserialise
     */
    public deserialise(values: Vector3Json): Vector3 {
        return this.set(values.x, values.y, values.z);
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
    public add(x: number, y: number, z: number, optres: Vector3 | undefined = undefined): Vector3 {
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
    public addVector(other: Vector3, optres: Vector3 | undefined = undefined): Vector3 {
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
    public addScalar(other: number, optres: Vector3 | undefined = undefined): Vector3 {
        return this.add(other, other, other, optres);
    }

    /**
     * Provided x, y, z components, subtract it from this Vector and return the results.
     * 
     * Optionally stores result in result Vector. If a result vector is not provided,
     * this vector will be modified
     * 
     * @param x Subtract from this Vector.x
     * @param y Subtract from this Vector.y
     * @param z Subtract from this Vector.z
     * @param optres (optional) The result to store in
     */
    public subtract(x: number, y: number, z: number, optres: Vector3 | undefined = undefined): Vector3 {
        const result: Vector3 = optres || this;

        result.x -= x;
        result.y -= y;
        result.z -= z;

        return result;
    }

    /**
     * Provided another Vector, subtract it from this Vector and return the results.
     * 
     * Optionally stores result in result Vector. If a result vector is not provided,
     * this vector will be modified
     * 
     * @param other The Vector to subtract from this Vector
     * @param optres (optional) The result to store in
     */
    public subtractVector(other: Vector3, optres: Vector3 | undefined = undefined): Vector3 {
        return this.subtract(other._x, other._y, other._z, optres);
    }

    /**
     * Provided another Scalar value, subtract it from this Vector and return the results.
     *
     * Optionally stores result in result Vector. If a result vector is not provided,
     * this vector will be modified
     *
     * @param other The Scalar value to subtract from each component of this Vector
     * @param optres (optional) The result to store in
     */
    public subtractScalar(other: number, optres: Vector3 | undefined = undefined): Vector3 {
        return this.subtract(other, other, other, optres);
    }

    /**
     * Provided x, y, z components, multiply it with this Vector and return the results.
     * 
     * Optionally stores result in result Vector. If a result vector is not provided,
     * this vector will be modified
     * 
     * @param x Multiply with this Vector.x
     * @param y Multiply with this Vector.y
     * @param z Multiply with this Vector.z
     * @param optres (optional) The result to store in
     */
    public multiply(x: number, y: number, z: number, optres: Vector3 | undefined = undefined): Vector3 {
        const result: Vector3 = optres || this;

        result.x *= x;
        result.y *= y;
        result.z *= z;

        return result;
    }

    /**
     * Provided another Vector, multiply it with this Vector and return the results.
     * 
     * Optionally stores result in result Vector. If a result vector is not provided,
     * this vector will be modified
     * 
     * @param other The Vector to multiply with this Vector
     * @param optres (optional) The result to store in
     */
    public multiplyVector(other: Vector3, optres: Vector3 | undefined = undefined): Vector3 {
        return this.multiply(other._x, other._y, other._z, optres);
    }

    /**
     * Provided another Scalar value, multiply it with this Vector and return the results.
     *
     * Optionally stores result in result Vector. If a result vector is not provided,
     * this vector will be modified
     *
     * @param other The Scalar value to multiply it with each component of this Vector
     * @param optres (optional) The result to store in
     */
    public multiplyScalar(other: number, optres: Vector3 | undefined = undefined): Vector3 {
        return this.multiply(other, other, other, optres);
    }

    /**
     * Calculate the euclidean length of this Vector
     */
    public get length(): number {
        return Math.sqrt(this.lengthSq);
    }

    /**
     * Calculate the squared euclidean length of this Vector
     * 
     * this operation is cheaper than .length() as it omits a Math.sqrt()
     */
    public get lengthSq(): number {
        return this._x * this._x + this._y * this._y + this._z * this._z;
    }

    /**
     * Calculates the squared euclidean distance to the provided components
     * 
     * this operation is cheaper than .distanceTo() as it omits a Math.sqrt()
     */
    public distanceToSq(other: Vector3): number {
        const dx: number = other._x - this._x;
        const dy: number = other._y - this._y;
        const dz: number = other._z - this._z;

        return dx * dx + dy * dy + dz * dz;
    }

    /**
     * Calculates the euclidean distance to the provided components
     */
    public distanceTo(other: Vector3): number {
        return Math.sqrt(this.distanceToSq(other));
    }

    /**
     * Normalise this vector so its length == 1
     */
    public normalise(): Vector3 {
        const lenSq: number = this.lengthSq;

        if (lenSq == 0 || lenSq == 1) {
            return this;
        }

        return this.multiplyScalar(Math.sqrt(lenSq));
    }

    /**
     * Calculate the dot product between this and other Vector
     */
    public dot(x: number, y: number, z: number): number {
        return this._x * x + this._y * y + this._z * z;
    }

    /**
     * Calculate the dot product between this and other Vector
     * 
     * @param other The other Vector to calculate the dot product
     */
    public dotVector(other: Vector3): number {
        return this.dot(other._x, other._y, other._z);
    }

    /**
     * Calculates and returns the cross product between Vectors
     * 
     * Optionally stores result in result Vector. If a result vector is not provided,
     * this vector will be modified
     * 
     * @param x The X component of the Vector
     * @param y The Y component of the Vector
     * @param z The Z component of the Vector
     * @param optres (optional) The result to store in
     */
    public cross(x: number, y: number, z: number, optres: Vector3 | undefined = undefined): Vector3 {
        const result: Vector3 = optres || this;

        const dx: number = this._x;
        const dy: number = this._y;
        const dz: number = this._z;

        result.x = dy * z - dz * y;
        result.y = dz * x - dx * z;
        result.z = dx * y - dy * x;

        return result;
    }

    /**
     * Calculates and returns the cross product between Vectors
     *
     * Optionally stores result in result Vector. If a result vector is not provided,
     * this vector will be modified
     * 
     * @param other The Vector to cross with this Vector
     * @param optres (optional) The result to store in
     */
    public crossVector(other: Vector3, optres: Vector3 | undefined = undefined): Vector3 {
        return this.cross(other._x, other._y, other._z, optres);
    }
}