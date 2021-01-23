import { Matrix4 } from "../../math/matrix4";
import { Mesh } from "../mesh/mesh";
import { Renderer } from "../renderer";
import { Component } from "../scriptable/component";
import { Material } from "../shader/material";
import { GfxLightsPragma } from "../shader/pragma/gfx-lights";
import { GfxMatricesPragma } from "../shader/pragma/gfx-matrices";

/**
 * Handles standard Mesh rendering
 */
export class MeshRenderer extends Component {
    // zero allocation temporary variables. This works since JavaScript
    // is single threaded, so there wont be any race conditions/deadlocks
    private static readonly _mv: Matrix4 = new Matrix4();
    private static readonly _mvp: Matrix4 = new Matrix4();
    private static readonly _mvt: Matrix4 = new Matrix4();

    private _mesh?: Mesh;
    private _material?: Material;

    private readonly _matrices: GfxMatricesPragma = new GfxMatricesPragma();
    private readonly _lights: GfxLightsPragma = new GfxLightsPragma();

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
        this._lights.material = this._material;
    }

    public create(): void {
        if (this._mesh === undefined || this._material === undefined || !this._material.valid) {
            return;
        }

        const gl: WebGL2RenderingContext = Renderer.instance.context.gl;

        this._mesh.upload(gl, this._material);
    }

    public update(deltaTime: number): void {
        if (this._material !== undefined && this._mesh !== undefined && this._material.valid) {
            const mesh: Mesh = this._mesh;
            const material: Material = this._material;
            const matrices: GfxMatricesPragma = this._matrices;
            const lights: GfxLightsPragma = this._lights;

            // bind our shader for this draw call
            material.bind();

            const projectionMatrix: Matrix4 = this.owner.stage.camera.cameraMatrix;
            const modelMatrix: Matrix4 = this.owner.transform.worldMatrix;
            const viewMatrix: Matrix4 = this.owner.stage.camera.transform.worldMatrix;
            const viewInverseMatrix: Matrix4 = this.owner.stage.camera.transform.worldMatrixInverse;

            // these require calculation before setting
            // gfx_ProjectionMatrix * gfx_ViewMatrix * gfx_ModelMatrix
            const modelViewMatrix: Matrix4 = MeshRenderer._mv;
            const modelViewProjectionMatrix: Matrix4 = MeshRenderer._mvp;
            const normalMatrix: Matrix4 = MeshRenderer._mvt;

            // calculate the modelView and modelViewProjection matrices
            Matrix4.multiply(viewInverseMatrix, modelMatrix, modelViewMatrix);
            Matrix4.multiply(projectionMatrix, modelViewMatrix, modelViewProjectionMatrix);

            // used for transforming normals for lighting purposes
            normalMatrix.copy(modelViewMatrix).resetPos().transpose();

            // set matrices
            matrices.projectionMatrix = projectionMatrix;
            matrices.modelMatrix = modelMatrix;
            matrices.viewMatrix = viewMatrix;
            matrices.viewInverseMatrix = viewInverseMatrix;
            matrices.mvpMatrix = modelViewProjectionMatrix;
            matrices.normalMatrix = normalMatrix;

            // set lights
            lights.lightDirection = this.owner.stage.light.direction;
            lights.lightColor = this.owner.stage.light.color;

            material.update();

            // begin rendering mesh
            mesh.bind();

            const length: number = mesh.indices.length;
            const gl: WebGL2RenderingContext = Renderer.instance.context.gl;

            // decide if we want to do wireframe rendering (for debug purposes)
            if (material.wireframe) {
                gl.drawElements(gl.LINE_STRIP, length, gl.UNSIGNED_SHORT, 0);
            }
            else {
                gl.drawElements(gl.TRIANGLES, length, gl.UNSIGNED_SHORT, 0);
            }

            // end rendering mesh
            mesh.unbind();
        }
    }

    public destroy(): void {
        if (this._material !== undefined) {
            this._material.destroy();
        }

        if (this._mesh !== undefined) {
            this._mesh.destroy();
        }

        this._material = undefined;
        this._mesh = undefined;

        // resets the pragma
        this._matrices.destroy();
    }

    public get valid(): boolean {
        return this._mesh !== undefined && (this._material !== undefined && this._material.valid);
    }
}