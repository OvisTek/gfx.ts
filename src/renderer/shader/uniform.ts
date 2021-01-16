/**
 * Represents a uniform value in a Shader
 */
export class Uniform {
    public static readonly INVALID = new Uniform();

    private readonly _name: string;
    private readonly _value: WebGLUniformLocation;
    private readonly _isValid: boolean;

    constructor(name: string = '', value: WebGLUniformLocation = 0) {
        this._name = name;
        this._value = value;
        this._isValid = this._name == '' ? false : true;
    }

    public get name(): string {
        return this._name;
    }

    public get location(): WebGLUniformLocation {
        return this._value;
    }

    public get valid(): boolean {
        return this._isValid;
    }
}