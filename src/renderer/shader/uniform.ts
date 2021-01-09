/**
 * Represents a uniform value in a Shader
 */
export class Uniform {
    private readonly _name: string;
    private readonly _value: WebGLUniformLocation;

    constructor(name: string, value: WebGLUniformLocation) {
        this._name = name;
        this._value = value;
    }

    public get name(): string {
        return this._name;
    }

    public get value(): WebGLUniformLocation {
        return this._value;
    }
}