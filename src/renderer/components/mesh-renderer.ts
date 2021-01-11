import { Mesh } from "../mesh/mesh";
import { Component } from "../scriptable/component";
import { Material } from "../shader/material";

/**
 * Handles standard Mesh rendering
 */
export class MeshRenderer extends Component {

    private _mesh?: Mesh;
    private _material?: Material;

    public get mesh(): Mesh | undefined {
        return this._mesh;
    }

    public set mesh(newMesh: Mesh | undefined) {
        this._mesh = newMesh;
    }

    public get material(): Material | undefined {
        return this._material;
    }

    public set material(newMaterial: Material | undefined) {
        this._material = newMaterial;
    }

    public create() {
        if (this._mesh && this._material && this._material.valid) {

        }
    }

    public update(deltaTime: number) {

    }

    public destroy() {

    }
}