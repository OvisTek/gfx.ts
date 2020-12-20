import { Quaternion } from "./quaternion";

/**
 * Read-Only special extension of Quaternion that does not allow setting internal
 * components. This is useful as a static version of the base Quaternion
 */
export class QuaternionRO extends Quaternion {

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        super(x, y, z, w);
    }

    public set x(value: number) {
        throw new Error("set Quaternion.x - cannot modify property as Quaternion is read-only");
    }

    public set y(value: number) {
        throw new Error("set Quaternion.y - cannot modify property as Quaternion is read-only");
    }

    public set z(value: number) {
        throw new Error("set Quaternion.z - cannot modify property as Quaternion is read-only");
    }

    public set w(value: number) {
        throw new Error("set Quaternion.w - cannot modify property as Quaternion is read-only");
    }
}