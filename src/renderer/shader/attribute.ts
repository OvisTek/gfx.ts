import { GlobalID } from "../../math/global-id";

/**
 * Represents an attribute value in a Shader
 */
export class Attribute {
    private readonly _id: number;
    private readonly _name: string;
    private readonly _value: number;

    constructor(name: string, value: number) {
        this._id = GlobalID.generate();
        this._name = name;
        this._value = value;
    }

    public get name(): string {
        return this._name;
    }

    public get location(): number {
        return this._value;
    }

    public get id(): number {
        return this._id;
    }
}