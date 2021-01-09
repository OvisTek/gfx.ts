import { Color } from "../../math/color";
import { Matrix4 } from "../../math/matrix4";
import { Vector3 } from "../../math/vector3";
import { Renderer } from "../renderer";
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
        const gl: WebGL2RenderingContext = Renderer.instance.gl;

        gl.uniform4f(uniform.location, color.r, color.g, color.b, color.a);
    }

    public setVector4(uniform: Uniform, vector: Vector3) {
        const gl: WebGL2RenderingContext = Renderer.instance.gl;

        gl.uniform4f(uniform.location, vector.x, vector.y, vector.z, 0.0);
    }

    public setVector3(uniform: Uniform, vector: Vector3) {
        const gl: WebGL2RenderingContext = Renderer.instance.gl;

        gl.uniform3f(uniform.location, vector.x, vector.y, vector.z);
    }

    public setMatrix(uniform: Uniform, matrix: Matrix4) {
        const gl: WebGL2RenderingContext = Renderer.instance.gl;

        gl.uniformMatrix4fv(uniform.location, false, matrix.values);
    }

    public setFloat(uniform: Uniform, value: number) {
        const gl: WebGL2RenderingContext = Renderer.instance.gl;

        gl.uniform1f(uniform.location, value);
    }

    public setInteger(uniform: Uniform, value: number) {
        const gl: WebGL2RenderingContext = Renderer.instance.gl;

        gl.uniform1i(uniform.location, value | 0);
    }

    public setColorVar(variableName: string, color: Color) {
        this.setColor(this._shader.uniform(variableName), color);
    }

    public setVector4Var(variableName: string, vector: Vector3) {
        this.setVector4(this._shader.uniform(variableName), vector);
    }

    public setVector3Var(variableName: string, vector: Vector3) {
        this.setVector3(this._shader.uniform(variableName), vector);
    }

    public setMatrixVar(variableName: string, matrix: Matrix4) {
        this.setMatrix(this._shader.uniform(variableName), matrix);
    }

    public setFloatVar(variableName: string, value: number) {
        this.setFloat(this._shader.uniform(variableName), value);
    }

    public setIntegerVar(variableName: string, value: number) {
        this.setInteger(this._shader.uniform(variableName), value);
    }
}