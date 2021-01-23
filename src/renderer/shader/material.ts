import { Color } from "../../math/color";
import { Matrix4 } from "../../math/matrix4";
import { Vector3 } from "../../math/vector3";
import { Renderer } from "../renderer";
import { Shader } from "./shader";
import { Texture } from "./texture";
import { Uniform } from "./uniform";
import { Identifiable } from "../identifiable";
import { Euler } from "../../math/euler";

/**
 * Allows saving for a specific function call with data (internal enum)
 */
enum UniformType {
    SET_COLOR,
    SET_VECTOR4,
    SET_VECTOR3,
    SET_MATRIX,
    SET_FLOAT,
    SET_INTEGER,
    SET_TEXTURE,
    SET_EULER
}

/**
 * Allows storing a Uniform and its specific value which will be passed
 * onto the shader during update
 */
class UniformPair {
    private readonly _uniform: Uniform;
    private _value?: any;

    constructor(uniform: Uniform, value: any | undefined = undefined) {
        this._uniform = uniform;
        this._value = value;
    }

    public get uniform(): Uniform {
        return this._uniform;
    }

    public get valid(): boolean {
        return this._uniform.valid;
    }

    public get value(): any | undefined {
        return this._value;
    }

    public set value(newValue: any | undefined) {
        this._value = newValue;
    }
}

/**
 * Represents a single Material with a Shader and helper functionality to set
 * uniforms and attributes
 */
export class Material extends Identifiable {
    private static _TEXTURE_UNIT: number = 0;

    private readonly _shader: Shader;

    // we store a map of a map, one map for the type and another for uniforms
    // NOTE: Uniform ID is unique and cannot have the same uniform multiple times per material
    private readonly _uniforms: Map<UniformType, Map<number, UniformPair>>;

    private _isWireframe: boolean;

    constructor(shader: Shader | undefined = undefined) {
        super();
        this._shader = shader ?? new Shader();
        this._uniforms = new Map<UniformType, Map<number, UniformPair>>();
        this._isWireframe = false;
    }

    /**
     * Returns the Shader instance of this Material
     */
    public get shader(): Shader {
        return this._shader;
    }

    public get wireframe(): boolean {
        return this._isWireframe;
    }

    /**
     * GET/SET wireframe mode rendering
     */
    public set wireframe(isWireframe: boolean) {
        this._isWireframe = isWireframe;
    }

    /**
     * Dispose/free all GPU memory for this Material
     */
    public destroy() {
        this._shader.destroy();
    }

    public bind() {
        const shader: Shader = this._shader;

        if (shader.valid) {
            shader.bind();
        }
    }

    public update() {
        // reset texture unit
        Material._TEXTURE_UNIT = 0;
        const gl: WebGL2RenderingContext = Renderer.instance.context.gl;

        // sets all saved shader variables here (if any)
        for (const [k, v] of this._uniforms) {
            const fnType: UniformType = k;
            const uniforms: Map<number, UniformPair> = v;

            this._callFn(fnType, uniforms, gl);
        }
    }

    private _callFn(type: UniformType, uniforms: Map<number, UniformPair>, gl: WebGL2RenderingContext) {
        switch (type) {
            case UniformType.SET_COLOR:
                for (const [, u] of uniforms) {
                    const pair: UniformPair = u;
                    const value: Color | undefined = pair.value;

                    if (value !== undefined) {
                        gl.uniform4f(pair.uniform.location, value.r, value.g, value.b, value.a);
                    }
                }
                break;
            case UniformType.SET_FLOAT:
                for (const [, u] of uniforms) {
                    const pair: UniformPair = u;
                    const value: number | undefined = pair.value;

                    if (value !== undefined) {
                        gl.uniform1f(pair.uniform.location, value);
                    }
                }
                break;
            case UniformType.SET_INTEGER:
                for (const [, u] of uniforms) {
                    const pair: UniformPair = u;
                    const value: number | undefined = pair.value;

                    if (value !== undefined) {
                        gl.uniform1i(pair.uniform.location, value | 0);
                    }
                }
                break;
            case UniformType.SET_MATRIX:
                for (const [, u] of uniforms) {
                    const pair: UniformPair = u;
                    const value: Matrix4 | undefined = pair.value;

                    if (value !== undefined) {
                        gl.uniformMatrix4fv(pair.uniform.location, false, value.values);
                    }
                }
                break;
            case UniformType.SET_VECTOR3:
                for (const [, u] of uniforms) {
                    const pair: UniformPair = u;
                    const value: Vector3 | undefined = pair.value;

                    if (value !== undefined) {
                        gl.uniform3f(pair.uniform.location, value.x, value.y, value.z);
                    }
                }
                break;
            case UniformType.SET_VECTOR4:
                for (const [, u] of uniforms) {
                    const pair: UniformPair = u;
                    const value: Vector3 | undefined = pair.value;

                    if (value !== undefined) {
                        gl.uniform4f(pair.uniform.location, value.x, value.y, value.z, 0.0);
                    }
                }
                break;
            case UniformType.SET_TEXTURE:
                for (const [, u] of uniforms) {
                    const pair: UniformPair = u;
                    const value: Texture | undefined = pair.value;

                    if (value !== undefined) {
                        const textureUnit: number = Material._TEXTURE_UNIT;
                        value.bind(gl, pair.uniform, textureUnit);
                        Material._TEXTURE_UNIT++;
                    }
                }
                break;
            case UniformType.SET_EULER:
                for (const [, u] of uniforms) {
                    const pair: UniformPair = u;
                    const value: Euler | undefined = pair.value;

                    if (value !== undefined) {
                        gl.uniform3f(pair.uniform.location, value.x, value.y, value.z);
                    }
                }
            default:
                break;
        }
    }

    /**
     * Checks if this Material is valid
     */
    public get valid(): boolean {
        return this._shader.valid;
    }

    public setColor(uniform: Uniform | string, color: Color): void {
        if (uniform instanceof Uniform) {
            const pair: UniformPair = this._getEnumValue(UniformType.SET_COLOR, uniform);
            pair.value = color;

            return;
        }

        this.setColor(this._shader.uniform(uniform), color);
    }

    public setVector4(uniform: Uniform | string, vector: Vector3): void {
        if (uniform instanceof Uniform) {
            const pair: UniformPair = this._getEnumValue(UniformType.SET_VECTOR4, uniform);
            pair.value = vector;

            return;
        }

        this.setVector4(this._shader.uniform(uniform), vector);
    }

    public setVector3(uniform: Uniform | string, vector: Vector3): void {
        if (uniform instanceof Uniform) {
            const pair: UniformPair = this._getEnumValue(UniformType.SET_VECTOR3, uniform);
            pair.value = vector;

            return;
        }

        this.setVector3(this._shader.uniform(uniform), vector);
    }

    public setEuler(uniform: Uniform | string, euler: Euler): void {
        if (uniform instanceof Uniform) {
            const pair: UniformPair = this._getEnumValue(UniformType.SET_EULER, uniform);
            pair.value = euler;

            return;
        }

        this.setEuler(this._shader.uniform(uniform), euler);
    }

    public setMatrix(uniform: Uniform | string, matrix: Matrix4): void {
        if (uniform instanceof Uniform) {
            const pair: UniformPair = this._getEnumValue(UniformType.SET_MATRIX, uniform);
            pair.value = matrix;

            return;
        }

        this.setMatrix(this._shader.uniform(uniform), matrix);
    }

    public setFloat(uniform: Uniform | string, value: number) {
        if (uniform instanceof Uniform) {
            const pair: UniformPair = this._getEnumValue(UniformType.SET_FLOAT, uniform);
            pair.value = value;

            return;
        }

        this.setFloat(this._shader.uniform(uniform), value);
    }

    public setInteger(uniform: Uniform | string, value: number) {
        if (uniform instanceof Uniform) {
            const pair: UniformPair = this._getEnumValue(UniformType.SET_INTEGER, uniform);
            pair.value = value;

            return;
        }

        this.setInteger(this._shader.uniform(uniform), value);
    }

    public setTexture(uniform: Uniform | string, texture: Texture) {
        if (uniform instanceof Uniform) {
            const pair: UniformPair = this._getEnumValue(UniformType.SET_TEXTURE, uniform);
            pair.value = texture;

            return;
        }

        this.setTexture(this._shader.uniform(uniform), texture);
    }

    /**
     * Private functionality that returns the collection instance for the provided Enum
     * 
     * @param value - the enum value to use
     */
    private _getEnumValue(value: UniformType, uniform: Uniform): UniformPair {
        if (!uniform.valid) {
            throw new Error("Material._getEnumValue(UniformType, Uniform) - provided uniform is invalid and cannot be used");
        }

        if (!uniform.belongsTo(this.shader)) {
            throw new Error("Material._getEnumValue(UniformType, Uniform) - provided uniform with name " + uniform.name + " does not belong to this material");
        }

        const collection: Map<number, UniformPair> | undefined = this._uniforms.get(value);
        const id: number = uniform.id;

        // we need to create a new collection
        if (collection === undefined) {
            const newCollection: Map<number, UniformPair> = new Map<number, UniformPair>();

            // new collection will need a new Uniform pair instance
            const newPair: UniformPair = new UniformPair(uniform);
            newCollection.set(id, newPair);

            this._uniforms.set(value, newCollection);

            return newPair;
        }

        // otherwise search for a previous uniform
        const oldPair: UniformPair | undefined = collection.get(id);

        // if the old pair does not exist, create a new one and add to collection
        if (oldPair === undefined) {
            const newPair: UniformPair = new UniformPair(uniform);

            collection.set(id, newPair);

            return newPair;
        }

        return oldPair;
    }
}