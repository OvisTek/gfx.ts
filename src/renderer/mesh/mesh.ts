import { Vector3 } from "../../math/vector3";
import { Color } from "../../math/color";

/**
 * Represents an Indexed Mesh for 3D Rendering
 */
export class Mesh {
    private static readonly _EMPTY: Array<number> = new Array<number>();

    private _vertices?: Array<number>;
    private _indices?: Array<number>;
    private _normals?: Array<number>;
    private _colors?: Array<number>;
    private _uv?: Array<number>;

    constructor() {
        this._vertices = undefined;
        this._indices = undefined;
        this._normals = undefined;
        this._colors = undefined;
        this._uv = undefined;
    }

    public get hasVertices(): boolean {
        return this._vertices != undefined && this._vertices.length > 0;
    }

    public get hasIndices(): boolean {
        return this._indices != undefined && this._indices.length > 0;
    }

    public get hasNormals(): boolean {
        return this._normals != undefined && this._normals.length > 0;
    }

    public get hasColors(): boolean {
        return this._colors != undefined && this._colors.length > 0;
    }

    public get hasUV(): boolean {
        return this._uv != undefined && this._uv.length > 0;
    }

    public get vertices(): Array<number> | undefined {
        return this._vertices;
    }

    public set vertices(newVertices: Array<number> | undefined) {
        this._vertices = newVertices;
    }

    public get indices(): Array<number> | undefined {
        return this._indices;
    }

    public set indices(newIndices: Array<number> | undefined) {
        this._indices = newIndices;
    }

    public get normals(): Array<number> | undefined {
        return this._normals;
    }

    public set normals(newNormals: Array<number> | undefined) {
        this._normals = newNormals;
    }

    public get colors(): Array<number> | undefined {
        return this._colors;
    }

    public set colors(newColors: Array<number> | undefined) {
        this._colors = newColors;
    }

    public get uv(): Array<number> | undefined {
        return this._uv;
    }

    public set uv(newUV: Array<number> | undefined) {
        this._uv = newUV;
    }

    public get verticesLength(): number {
        return this.hasVertices ? this._vertices.length : 0;
    }

    public get indicesLength(): number {
        return this.hasIndices ? this._indices.length : 0;
    }

    public get normalsLength(): number {
        return this.hasNormals ? this._normals.length : 0;
    }

    public get colorsLength(): number {
        return this.hasColors ? this._colors.length : 0;
    }

    public get uvLength(): number {
        return this.hasUV ? this._uv.length : 0;
    }

    public get vertexBuffer(): Float32Array {
        return new Float32Array(this.hasVertices ? this._vertices : Mesh._EMPTY);
    }

    public get indexBuffer(): Uint32Array {
        return new Uint32Array(this.hasIndices ? this._indices : Mesh._EMPTY);
    }

    public get normalBuffer(): Float32Array {
        return new Float32Array(this.hasNormals ? this._normals : Mesh._EMPTY);
    }

    public get colorBuffer(): Float32Array {
        return new Float32Array(this.hasColors ? this._colors : Mesh._EMPTY);
    }

    public get uvBuffer(): Float32Array {
        return new Float32Array(this.hasUV ? this._uv : Mesh._EMPTY);
    }

    /**
     * Sets the current vertices from an Array of Vector3
     * NOTE: The Vector3 array will be unpacked which could have unintended performance
     * issues at runtime. For speed use Mesh.vertices instead.
     * 
     * @param verts - The Vector3 Array to use as vertices for this Mesh
     */
    public setVertices(verts: Array<Vector3>): Mesh {
        const length: number = verts.length;

        if (!this._vertices) {
            this._vertices = new Array<number>();
        }

        const buff: Array<number> = this._vertices;
        buff.length = 0;

        for (let i = 0; i < length; i++) {
            const vec: Vector3 = verts[i];

            buff.push(vec.x);
            buff.push(vec.y);
            buff.push(vec.z);
        }

        return this;
    }

    /**
     * Sets the current indices from an Array of numbers
     * NOTE: The Array will be copied to an internal buffer which could have unintended
     * performance issues at runtime. For speed use Mesh.indices instead.
     * 
     * @param indices - The Indices Array to use as indices for this Mesh
     */
    public setIndices(indices: Array<number>): Mesh {
        const length: number = indices.length;

        if (!this._indices) {
            this._indices = new Array<number>();
        }

        const buff: Array<number> = this._indices;
        buff.length = 0;

        for (let i = 0; i < length; i++) {
            buff.push(indices[i]);
        }

        return this;
    }

    /**
     * Sets the current colors from an Array of Color
     * NOTE: The Color array will be unpacked which could have unintended performance
     * issues at runtime. For speed use Mesh.colors instead.
     * 
     * @param colors - The Color Array to use as colors for this Mesh
     */
    public setColors(colors: Array<Color>): Mesh {
        const length: number = colors.length;

        if (!this._colors) {
            this._colors = new Array<number>();
        }

        const buff: Array<number> = this._colors;
        buff.length = 0;

        for (let i = 0; i < length; i++) {
            const color: Color = colors[i];

            buff.push(color.rgba8888);
        }

        return this;
    }
}