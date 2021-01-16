import { GlobalID } from "../../math/global-id";

/**
 * Represents a uniform value in a Shader
 */
export class Uniform {
    public static readonly INVALID = new Uniform();

    private readonly _id: number;
    private readonly _name: string;
    private readonly _value: WebGLUniformLocation;
    private readonly _isValid: boolean;

    constructor(name: string = '', value: WebGLUniformLocation = 0) {
        this._id = GlobalID.generate();
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

    public get id(): number {
        return this._id;
    }

    public get valid(): boolean {
        return this._isValid;
    }
}