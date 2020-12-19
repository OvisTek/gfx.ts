export class Vector3 {
    // static members
    public static readonly Zero: Vector3 = new Vector3(0.0, 0.0, 0.0);

    public x: number;
    public y: number;
    public z: number;

    constructor(x: number = 0.0, y: number = 0.0, z: number = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}