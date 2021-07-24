import { Euler, Object3D, Quaternion, Vector3 } from "three";
import { Util } from "../util/util";
import { Identifiable } from "./identifiable";
import { Entity } from "./stage/entity";

/**
 * Transform is responsible for allowing positioning, rotating and scaling of
 * 3D objects in the Renderer.
 * 
 * When assigning new values for a Transform, the values are copied
 */
export class Transform extends Identifiable {
    private readonly _threeObject: Object3D;
    private readonly _owner: Entity;
    private readonly _children: Array<Transform>;

    private _parent: Transform | null = null;

    constructor(owner: Entity) {
        super();
        this._children = new Array<Transform>();
        this._threeObject = new Object3D();
        this._owner = owner;
    }

    /**
     * Returns the THREE.js Object backing
     */
    public get object(): Object3D {
        return this._threeObject;
    }

    public get position(): Vector3 {
        return this._threeObject.position;
    }

    public set position(pos: Vector3) {
        this._threeObject.position.copy(pos);
    }

    public get orientation(): Quaternion {
        return this._threeObject.quaternion;
    }

    public set orientation(quat: Quaternion) {
        this._threeObject.quaternion.copy(quat);
    }

    public get rotation(): Euler {
        return this._threeObject.rotation;
    }

    public set rotation(rot: Euler) {
        this._threeObject.rotation.copy(rot);
    }

    public get scale(): Vector3 {
        return this._threeObject.scale;
    }

    public set scale(sca: Vector3) {
        this._threeObject.scale.copy(sca);
    }

    /**
     * Returns the current entity this transform is attached to
     */
    public get owner(): Entity {
        return this._owner;
    }

    /**
     * Returns the parent Transform if any or null.
     * To set the parent, use Transform.add()
     */
    public get parent(): Transform | null {
        return this._parent;
    }

    /**
     * Returns the children Transforms as an Array
     */
    public get children(): Array<Transform> {
        return this._children;
    }

    /**
     * Detach this Transform from a previous hierarchy
     * @returns - true if deatched, false otherwise
     */
    public detach(): boolean {
        // nothing to detach
        if (!this._parent) {
            return false;
        }

        // otherwise detach from hierarchy
        this._parent.remove(this);

        return true;
    }

    /**
     * Adds another transform into this transform hierarchy
     * @param transform - the transform to add into this hierarchy
     * @param preserveWorld - (optional - default: true) should the world coordinate be preserved?
     * @returns - this transform
     */
    public add(transform: Transform, preserveWorld: boolean = true): Transform {
        // the transform being added is already a hierarchy of this transform
        // there is nothing to do in this scenario
        if (this.is(transform._parent)) {
            return this;
        }

        // if the transform being added has another parent, we need to detach from
        // the previous hierarchy
        transform.detach();

        // this should not actually happen, but here just in-case
        // throw an error letting the user know something odd happened
        if (transform._parent !== null) {
            throw new Error("Transform.add(Transform, boolean) - an internal error happened, the transform could not be detached correctly, cannot proceed");
        }

        // set the new parent of the target transform as this transform
        transform._parent = this;

        if (preserveWorld === true) {
            this._threeObject.attach(transform._threeObject);
        }
        else {
            this._threeObject.add(transform._threeObject);
        }

        this._children.push(transform);

        return this;
    }

    /**
     * Removes the provided transform from this object hierarchy
     * @param transform - the transform to remove from this object hirarchy
     * @returns - this transform
     */
    public remove(transform: Transform): Transform {
        // the transform being removed is not actually part of this transform
        // hierarchy, thus there is nothing to do
        if (!this.is(transform._parent)) {
            return this;
        }

        Util.removeFromArray(this._children, transform);

        // remove from THREE.js hierarchy
        this._threeObject.remove(transform._threeObject);

        // reset the target transform parent to be null
        transform._parent = null;

        return this;
    }
}