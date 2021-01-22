import { Matrix4 } from "../../../math/matrix4";
import { Material } from "../material";
import { Uniform } from "../uniform";

/**
 * Allows easy management of the gfx-matrices.glsl pragma
 * 
 * See gfx_matrices.glsl pragma target
 */
export class GfxMatricesPragma {
    private _owner?: Material;

    // uniforms to be set
    // NOTE - these can be upgraded to UBO at some point
    private _projectionMatrix: Uniform;
    private _modelMatrix: Uniform;
    private _viewMatrix: Uniform;
    private _viewInverseMatrix: Uniform;
    private _mvpMatrix: Uniform;
    private _normalMatrix: Uniform;

    constructor() {
        this._owner = undefined;
        this._projectionMatrix = Uniform.INVALID;
        this._modelMatrix = Uniform.INVALID;
        this._viewMatrix = Uniform.INVALID;
        this._viewInverseMatrix = Uniform.INVALID;
        this._mvpMatrix = Uniform.INVALID;
        this._normalMatrix = Uniform.INVALID;
    }

    /**
     * Checks if this pragma is valid
     */
    public get valid(): boolean {
        return this._owner !== undefined;
    }

    /**
     * Sets the material owner of this pragma
     */
    public set material(owner: Material | undefined) {
        if (this._owner === owner) {
            return;
        }

        if (owner === undefined) {
            this.destroy();
            return;
        }

        this._projectionMatrix = owner.shader.uniform("gfx_projectionMatrix");
        this._modelMatrix = owner.shader.uniform("gfx_modelMatrix");
        this._viewMatrix = owner.shader.uniform("gfx_viewMatrix");
        this._viewInverseMatrix = owner.shader.uniform("gfx_viewInverseMatrix");
        this._mvpMatrix = owner.shader.uniform("gfx_mvpMatrix");
        this._normalMatrix = owner.shader.uniform("gfx_normalMatrix");

        this._owner = owner;
    }

    public set projectionMatrix(data: Matrix4) {
        this._setMatrixForUniform(this._projectionMatrix, data);
    }

    public set modelMatrix(data: Matrix4) {
        this._setMatrixForUniform(this._modelMatrix, data);
    }

    public set viewMatrix(data: Matrix4) {
        this._setMatrixForUniform(this._viewMatrix, data);
    }

    public set viewInverseMatrix(data: Matrix4) {
        this._setMatrixForUniform(this._viewInverseMatrix, data);
    }

    public set mvpMatrix(data: Matrix4) {
        this._setMatrixForUniform(this._mvpMatrix, data);
    }

    public set normalMatrix(data: Matrix4) {
        this._setMatrixForUniform(this._normalMatrix, data);
    }

    private _setMatrixForUniform(uniform: Uniform, data: Matrix4): void {
        if (this._owner === undefined) {
            throw new Error("GfxMatricesPragma._setMatrixForUniform(Uniform, Matrix4) - called invalid pragma, object is missing owner");
        }

        if (uniform.valid) {
            this._owner.setMatrix(uniform, data);
        }
    }

    /**
     * Resets everything. NOTE this does not call destroy on the actual
     * internal material, just resets references
     */
    public destroy(): void {
        this._owner = undefined;
        this._projectionMatrix = Uniform.INVALID;
        this._modelMatrix = Uniform.INVALID;
        this._viewMatrix = Uniform.INVALID;
        this._viewInverseMatrix = Uniform.INVALID;
        this._mvpMatrix = Uniform.INVALID;
        this._normalMatrix = Uniform.INVALID;
    }
}