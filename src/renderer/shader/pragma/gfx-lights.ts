import { Color } from "../../../math/color";
import { Euler } from "../../../math/euler";
import { Material } from "../material";
import { Uniform } from "../uniform";

/**
 * Allows easy management of the gfx-matrices.glsl pragma
 * 
 * See gfx_matrices.glsl pragma target
 */
export class GfxLightsPragma {
    private _owner?: Material;

    // uniforms to be set
    // NOTE - these can be upgraded to UBO at some point
    private _lightDirection: Uniform;
    private _lightColor: Uniform;

    constructor() {
        this._owner = undefined;
        this._lightDirection = Uniform.INVALID;
        this._lightColor = Uniform.INVALID;
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

        this._lightDirection = owner.shader.uniform("gfx_lightDirection");
        this._lightColor = owner.shader.uniform("gfx_lightColor");

        this._owner = owner;
    }

    public set lightDirection(data: Euler) {
        if (this._owner === undefined) {
            throw new Error("set GfxLightsPragma.lightDirection(Euler) - called invalid pragma, object is missing owner");
        }

        if (this._lightDirection.valid) {
            this._owner.setEuler(this._lightDirection, data);
        }
    }

    public set lightColor(data: Color) {
        if (this._owner === undefined) {
            throw new Error("set GfxLightsPragma.lightColor(Color) - called invalid pragma, object is missing owner");
        }

        if (this._lightColor.valid) {
            this._owner.setColor(this._lightColor, data);
        }
    }

    /**
     * Resets everything. NOTE this does not call destroy on the actual
     * internal material, just resets references
     */
    public destroy(): void {
        this._owner = undefined;
        this._lightDirection = Uniform.INVALID;
        this._lightColor = Uniform.INVALID;
    }
}