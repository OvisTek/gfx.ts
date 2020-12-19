import { Vector3RO } from "./vector3ro";

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
}