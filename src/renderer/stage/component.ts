import { Object3D } from "three";
import { Identifiable } from "../identifiable";

export class Component extends Identifiable {
    private readonly _threeObject: Object3D;

    constructor(object: Object3D) {
        super();
        this._threeObject = object;
    }

    public get object(): Object3D {
        return this._threeObject;
    }
}