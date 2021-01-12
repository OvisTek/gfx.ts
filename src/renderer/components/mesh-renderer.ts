import { Mesh } from "../mesh/mesh";
import { Renderer } from "../renderer";
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
        const gl: WebGL2RenderingContext = Renderer.instance.gl;

        if (this._mesh && this._material && this._material.valid) {
            // create and upload mesh data to the provided shader
            this._mesh.upload(gl, this._material);
        }
    }

    public update(deltaTime: number) {
        if (this.valid) {
            this._material.shader.bind();
            this._mesh.bind();

            const length = this._mesh.indices.length;

            const gl: WebGL2RenderingContext = Renderer.instance.gl;

            gl.drawElements(gl.TRIANGLES, length, gl.UNSIGNED_SHORT, 0);
        }
    }

    public destroy() {
        this._material.destroy();
        this._mesh.destroy();
    }

    public get valid(): boolean {
        return this._mesh != undefined && (this._material != undefined && this._material.valid);
    }
}