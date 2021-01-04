import { Euler } from "../math/euler";
import { MathUtil } from "../math/math-util";
import { Matrix4 } from "../math/matrix4";
import { Quaternion } from "../math/quaternion";
import { Vector3 } from "../math/vector3";

/**
 * Transform is responsible for allowing positioning, rotating and scaling of
 * 3D objects in the Renderer.
 * 
 * When assigning new values for a Transform, the values are copied
 */
export class Transform {
    // these are the components that should be used to control this transform
    private readonly _position: Vector3;
    private readonly _rotation: Quaternion;
    private readonly _scale: Vector3;
    private readonly _euler: Euler;

    // these components are updated automatically based on the scene-graph
    private readonly _localMatrix: Matrix4;
    private readonly _worldMatrix: Matrix4;

    // the previously computed hash of this Transform
    private _hash: number = 0;
    private _parentHash: number = 0;

    constructor() {
        this._position = new Vector3();
        this._rotation = new Quaternion();
        this._scale = new Vector3(1, 1, 1);
        this._localMatrix = new Matrix4();
        this._worldMatrix = new Matrix4();
    }

    public get position(): Vector3 {
        return this._position;
    }

    public set position(value: Vector3) {
        this._position.copy(value);
    }

    public get rotation(): Quaternion {
        return this._rotation;
    }

    public set rotation(value: Quaternion) {
        this._rotation.copy(value);
    }

    public get scale(): Vector3 {
        return this._scale;
    }

    public set scale(value: Vector3) {
        this._scale.copy(value);
    }

    public get euler(): Euler {
        this._rotation.euler(this._euler);

        return this._euler;
    }

    public set euler(value: Euler) {
        value.quaternion(this._rotation);
    }

    /**
     * Returns the 4x4 Matrix reference that represents this Transform in local/object space
     * 
     * NOTE: Unless manual update is enabled, the contents of this matrix will override each frame
     */
    public get localMatrix(): Matrix4 {
        return this._localMatrix;
    }

    /**
     * Returns the 4x4 Matrix reference that represents this Transform in world space
     * 
     * NOTE: The contents of this matrix will override each frame. For root objects, the localMatrix is
     * also the world matrix.
     */
    public get worldMatrix(): Matrix4 {
        return this._worldMatrix;
    }

    /**
     * Returns the previously computed hash of this Transform derived from
     * its components
     */
    public get hash(): number {
        return this._hash;
    }

    /**
     * Generates a hash-code of this Transform. The hash can be used to check if
     * the transform has actually updated or requires some form of update
     */
    public get hashCode(): number {
        const prime: number = 31;
        let result: number = 1;

        // hash the position
        result = prime * result + MathUtil.floatToIntBits(this._position.x);
        result = prime * result + MathUtil.floatToIntBits(this._position.y);
        result = prime * result + MathUtil.floatToIntBits(this._position.z);

        // hash the rotation
        result = prime * result + MathUtil.floatToIntBits(this._rotation.x);
        result = prime * result + MathUtil.floatToIntBits(this._rotation.y);
        result = prime * result + MathUtil.floatToIntBits(this._rotation.z);
        result = prime * result + MathUtil.floatToIntBits(this._rotation.w);

        // hash the scale
        result = prime * result + MathUtil.floatToIntBits(this._scale.x);
        result = prime * result + MathUtil.floatToIntBits(this._scale.y);
        result = prime * result + MathUtil.floatToIntBits(this._scale.z);

        return result;
    }

    /**
     * Called by the renderer to update the world position of this transform.
     * Passes the transform that represents the parent/root of this transform
     * 
     * @param parent The parent transform that should be used to update this transform
     */
    public apply(parent: Transform): void {
        // update the local matrix from position, rotation and scale
        const isUpdated: boolean = this.updateLocalMatrix();

        const parentHash = parent.hash;

        // we update the world matrix only if either the local transform has changed
        // or the parent transform has changed
        if (isUpdated || parentHash != this._parentHash) {
            // update the world matrix of this transform from parent
            Matrix4.multiply(parent.worldMatrix, this._localMatrix, this._worldMatrix);
        }

        // update hash codes for the next apply() call
        this._parentHash = parentHash;
    }

    /**
     * Updates/Composes local matrix if needed from position, rotation and scale components
     */
    private updateLocalMatrix(): boolean {
        const computedHash: number = this.hashCode;

        // this means the transform has changed since the last update, we need to re-update
        // the local matrix
        if (computedHash != this._hash) {
            this._localMatrix.composePosRotSca(this._position, this._rotation, this._scale);

            return true;
        }

        this._hash = computedHash

        return false;
    }
}