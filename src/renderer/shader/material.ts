import { Color } from "../../math/color";
import { Matrix4 } from "../../math/matrix4";
import { Vector3 } from "../../math/vector3";
import { Shader } from "./shader";
import { Uniform } from "./uniform";

/**
 * Represents a single Material with a Shader and helper functionality to set
 * uniforms and attributes
 */
export class Material {
    private readonly _shader: Shader;

    constructor(shader: Shader | undefined = undefined) {
        this._shader = shader || new Shader();
    }

    /**
     * Returns the Shader instance of this Material
     */
    public get shader(): Shader {
        return this._shader;
    }

    /**
     * Dispose/free all GPU memory for this Material
     */
    public destroy() {
        this._shader.destroy();
    }

    /**
     * Checks if this Material is valid
     */
    public get valid(): boolean {
        return this._shader.valid;
    }

    public setColor(uniform: Uniform, color: Color) {

    }

    public setVector(uniform: Uniform, vector: Vector3) {

    }

    public setMatrix(uniform: Uniform, matrix: Matrix4) {

    }

    public setNumber(uniform: Uniform, value: number) {

    }

    public setColorVar(variableName: string, color: Color) {
        this.setColor(this._shader.uniform(variableName), color);
    }

    public setVectorVar(variableName: string, vector: Vector3) {
        this.setVector(this._shader.uniform(variableName), vector);
    }

    public setMatrixVar(variableName: string, matrix: Matrix4) {
        this.setMatrix(this._shader.uniform(variableName), matrix);
    }

    public setNumberVar(variableName: string, value: number) {
        this.setNumber(this._shader.uniform(variableName), value);
    }
}