import { Matrix4 } from "../../math/matrix4";
import { Mesh } from "../mesh/mesh";
import { Renderer } from "../renderer";
import { Component } from "../scriptable/component";
import { Material } from "../shader/material";
import { GfxMatricesPragma } from "../shader/pragma/gfx-matrices";

/**
 * Handles standard Mesh rendering
 */
export class MeshRenderer extends Component {

    private _mesh?: Mesh;
    private _material?: Material;

    private readonly _matrices: GfxMatricesPragma = new GfxMatricesPragma();
    private readonly _mv: Matrix4 = new Matrix4();
    private readonly _mvp: Matrix4 = new Matrix4();
    private readonly _mvt: Matrix4 = new Matrix4();

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

        // resets the pragma so we are targeting the new material
        this._matrices.material = this._material;
    }

    public create(): void {
        if (this._mesh == undefined || this._material == undefined || !this._material.valid) {
            return;
        }

        const gl: WebGL2RenderingContext = Renderer.instance.context.gl;

        this._mesh.upload(gl, this._material);
    }

    public update(deltaTime: number): void {
        if (this._material != undefined && this._mesh != undefined && this._material.valid) {
            const mesh: Mesh = this._mesh;
            const material: Material = this._material;
            const matrices: GfxMatricesPragma = this._matrices;

            // bind our shader for this draw call
            material.bind();

            const projectionMatrix: Matrix4 = this.owner.stage.camera.cameraMatrix;
            const modelMatrix: Matrix4 = this.owner.transform.worldMatrix;
            const viewMatrix: Matrix4 = this.owner.stage.camera.transform.worldMatrix;
            const viewInverseMatrix: Matrix4 = this.owner.stage.camera.transform.worldMatrixInverse;

            // these require calculation before setting
            // gfx_ProjectionMatrix * gfx_ViewMatrix * gfx_ModelMatrix
            const modelViewMatrix: Matrix4 = this._mv;
            const modelViewProjectionMatrix: Matrix4 = this._mvp;
            const normalMatrix: Matrix4 = this._mvt;

            // calculate the modelView and modelViewProjection matrices
            Matrix4.multiply(viewInverseMatrix, modelMatrix, modelViewMatrix);
            Matrix4.multiply(projectionMatrix, modelViewMatrix, modelViewProjectionMatrix);

            // used for transforming normals for lighting purposes
            normalMatrix.copy(modelViewMatrix).transpose();

            matrices.projectionMatrix = projectionMatrix;
            matrices.modelMatrix = modelMatrix;
            matrices.viewMatrix = viewMatrix;
            matrices.viewInverseMatrix = viewInverseMatrix;
            matrices.mvpMatrix = modelViewProjectionMatrix;
            matrices.normalMatrix = normalMatrix;

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

        // resets the pragma
        this._matrices.destroy();
    }

    public get valid(): boolean {
        return this._mesh != undefined && (this._material != undefined && this._material.valid);
    }
}