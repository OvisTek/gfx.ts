/**
 * Represents an attribute value in a Shader
 */
export class Attribute {
    private readonly _name: string;
    private readonly _value: number;

    constructor(name: string, value: number) {
        this._name = name;
        this._value = value;
    }

    public get name(): string {
        return this._name;
    }

    public get location(): number {
        return this._value;
    }
}