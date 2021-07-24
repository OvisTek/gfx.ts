import { Entity, EntityOptions } from "../stage/entity";

/**
 * All cameras are scene entities like any other as such are part
 * of the Scene-Graph
 */
export abstract class Camera extends Entity {
    public abstract get isPerspective(): boolean;
    public abstract get isOrthographic(): boolean;

    private _lock: boolean = false;

    public get lock(): boolean {
        return this._lock;
    }

    public set lock(locked: boolean) {
        this._lock = locked;
    }
}