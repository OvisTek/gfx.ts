import { MathUtil } from "./math-util";
import { Vector3 } from "./vector3";

/**
 * See Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
 * See Ref: https://github.com/mrdoob/three.js/blob/master/src/math/Spherical.js
 * 
 * This is a port from THREE.js Spherical class for TypeScript
 */
export class Spherical {

    private _radius: number;
    private _phi: number;
    private _theta: number;

    constructor(radius: number = 1.0, phi: number = 0.0, theta: number = 0.0) {
        this._radius = radius;
        this._phi = phi;
        this._theta = theta;
    }

    public get radius(): number {
        return this._radius;
    }

    public get phi(): number {
        return this._phi;
    }

    public get theta(): number {
        return this._theta;
    }

    public setFromVector3(vec: Vector3): Spherical {
        return this.setFromCartesianCoords(vec.x, vec.y, vec.z);
    }

    public setFromCartesianCoords(x: number, y: number, z: number): Spherical {
        this._radius = Math.sqrt(x * x + y * y + z * z);

        if (this._radius === 0) {
            this._theta = 0.0;
            this._phi = 0.0;
        }
        else {
            this._theta = Math.atan2(x, z);
            this._phi = Math.acos(MathUtil.clamp(y / this._radius, -1.0, 1.0));
        }

        return this;
    }

    /**
     * Copies an existing Spherical into this Spherical
     * 
     * @param sph The Spherical to copy
     */
    public copy(sph: Spherical): Spherical {
        this._radius = sph._radius;
        this._theta = sph._theta;
        this._phi = sph._phi;

        return this;
    }

    /**
     * Clones the current Spherical and returns a new instance
     */
    public clone(): Spherical {
        return new Spherical().copy(this);
    }

    /**
     * Sets all components to zero/default state
     */
    public zero(): Spherical {
        this._radius = 0;
        this._theta = 0;
        this._phi = 0;

        return this;
    }
}