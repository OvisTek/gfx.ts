import { Vector3 } from "./vector3";

/**
 * Special extension of Vector3 that does not allow setting internal
 * components. This is useful as a static version of the base Vector3
 */
export class Vector3RO extends Vector3 {
    public set x(value: number) {
        throw new Error("set Vector3.x - cannot modify property as Vector3 is read-only");
    }

    public set y(value: number) {
        throw new Error("set Vector3.y - cannot modify property as Vector3 is read-only");
    }

    public set z(value: number) {
        throw new Error("set Vector3.z - cannot modify property as Vector3 is read-only");
    }
}