import { Mesh } from "../mesh/mesh";
import { Renderer } from "../renderer";
import { Component } from "../scriptable/component";
import { Material } from "../shader/material";
import { Uniform } from "../shader/uniform";

/**
 * Handles standard Mesh rendering
 */
export class MeshRenderer extends Component {

    private _mesh?: Mesh;
    private _material?: Material;

    // uniforms to be set before every render
    private _modelMatrix: Uniform = Uniform.INVALID;
    private _viewMatrix: Uniform = Uniform.INVALID;
    private _projectionMatrix: Uniform = Uniform.INVALID;

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

    public create(): void {
        if (this._mesh == undefined || this._material == undefined || !this._material.valid) {
            return;
        }

        this._modelMatrix = this._material.shader.uniform("gfx_ModelMatrix");
        this._viewMatrix = this._material.shader.uniform("gfx_ViewMatrix");
        this._projectionMatrix = this._material.shader.uniform("gfx_ProjectionMatrix");

        const gl: WebGL2RenderingContext = Renderer.instance.context.gl;

        this._mesh.upload(gl, this._material);
    }

    public update(deltaTime: number): void {
        if (this._material != undefined && this._mesh != undefined && this._material.valid) {
            const mesh: Mesh = this._mesh;
            const material: Material = this._material;

            // bind our shader for this draw call
            material.bind();

            // upload view matrix
            material.setMatrix(this._viewMatrix, this.owner.stage.camera.transform.worldMatrixInverse);
            // upload model matrix
            material.setMatrix(this._modelMatrix, this.owner.transform.worldMatrix);
            // upload projection matrix
            material.setMatrix(this._projectionMatrix, this.owner.stage.camera.cameraMatrix);

            material.update();

            // begin rendering mesh
            mesh.bind();

            const length: number = mesh.indices.length;
            const gl: WebGL2RenderingContext = Renderer.instance.context.gl;
            gl.drawElements(gl.TRIANGLES, length, gl.UNSIGNED_SHORT, 0);

            // end rendering mesh
            mesh.unbind();
        }
    }

    public destroy(): void {
        if (this._material != undefined) {
            this._material.destroy();
        }

        if (this._mesh != undefined) {
            this._mesh.destroy();
        }

        this._material = undefined;
        this._mesh = undefined;
    }

    public get valid(): boolean {
        return this._mesh != undefined && (this._material != undefined && this._material.valid);
    }
}