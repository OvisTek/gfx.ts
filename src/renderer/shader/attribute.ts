import { Identifiable } from "../identifiable";
import { Shader } from "./shader";

/**
 * Represents an attribute value in a Shader
 */
export class Attribute extends Identifiable {
    private readonly _name: string;
    private readonly _value: number;
    private readonly _shaderID: number;

    constructor(name: string, value: number, shader: Shader | undefined = undefined) {
        super();
        this._name = name;
        this._value = value;
        this._shaderID = shader != undefined ? shader.id : -1;
    }

    public get name(): string {
        return this._name;
    }

    public get location(): number {
        return this._value;
    }

    /**
     * Checks if this attribute belongs to the provided Shader
     * 
     * @param shader - the shader to check against
     */
    public belongsTo(shader: Shader): boolean {
        return this._shaderID === shader.id;
    }
}