import { Identifiable } from "../identifiable";
import { Shader } from "./shader";

/**
 * Represents a uniform value in a Shader
 */
export class Uniform extends Identifiable {
    public static readonly INVALID = new Uniform('INVALID', 0);

    private readonly _name: string;
    private readonly _value: WebGLUniformLocation;
    private readonly _shaderID: number;

    constructor(name: string, value: WebGLUniformLocation, shader: Shader | undefined = undefined) {
        super();
        this._name = name;
        this._value = value;
        this._shaderID = shader != undefined ? shader.id : -1;
    }

    public get name(): string {
        return this._name;
    }

    public get location(): WebGLUniformLocation {
        return this._value;
    }

    /**
     * Checks if this uniform belongs to the provided Shader
     * 
     * @param shader - the shader to check against
     */
    public belongsTo(shader: Shader): boolean {
        return this._shaderID === shader.id;
    }
}