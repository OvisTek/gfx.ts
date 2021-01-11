import { Vector3 } from "../../math/vector3";
import { Color } from "../../math/color";
import { Material } from "../shader/material";
import { Attribute } from "../shader/attribute";
import { Renderer } from "../renderer";

/**
 * Represents a single MeshComponent. This is an internal class managed
 * by the Mesh system
 */
class MeshComponent {
    private _data?: Array<number>;
    private _buffer?: WebGLBuffer;

    constructor() {
        this._data = undefined;
        this._buffer = undefined;
    }

    public get valid(): boolean {
        return this._data && this._data.length > 0;
    }

    public get data(): Array<number> | undefined {
        return this._data;
    }

    public get cleanData(): Array<number> {
        if (this._data == undefined) {
            this._data = new Array<number>();
        }

        this._data.length = 0;

        return this._data;
    }

    public set data(newData: Array<number> | undefined) {
        this._data = newData;
    }

    public get length(): number {
        return this.valid ? this._data.length : 0;
    }

    public get buffer(): WebGLBuffer | undefined {
        return this._buffer;
    }

    public set buffer(newBuffer: WebGLBuffer | undefined) {
        this._buffer = newBuffer;
    }

    public destroy(gl: WebGL2RenderingContext) {
        if (this._buffer != undefined) {
            gl.deleteBuffer(this._buffer);
        }

        this._buffer = undefined;
        this._data = undefined;
    }
}

/**
 * Represents an Indexed Mesh for 3D Rendering
 */
export class Mesh {
    private static readonly _EMPTY: Array<number> = new Array<number>();

    private readonly _vertices: MeshComponent;
    private readonly _indices: MeshComponent;
    private readonly _normals: MeshComponent;
    private readonly _colors: MeshComponent;
    private readonly _uv: MeshComponent;

    constructor() {
        this._vertices = new MeshComponent();
        this._indices = new MeshComponent();
        this._normals = new MeshComponent();
        this._colors = new MeshComponent();
        this._uv = new MeshComponent();
    }

    public get hasVertices(): boolean {
        return this._vertices.valid;
    }

    public get hasIndices(): boolean {
        return this._indices.valid;
    }

    public get hasNormals(): boolean {
        return this._normals.valid;
    }

    public get hasColors(): boolean {
        return this._colors.valid;
    }

    public get hasUV(): boolean {
        return this._uv.valid;
    }

    public get vertices(): Array<number> | undefined {
        return this._vertices.data;
    }

    public set vertices(newVertices: Array<number> | undefined) {
        this._vertices.data = newVertices;
    }

    public get indices(): Array<number> | undefined {
        return this._indices.data;
    }

    public set indices(newIndices: Array<number> | undefined) {
        this._indices.data = newIndices;
    }

    public get normals(): Array<number> | undefined {
        return this._normals.data;
    }

    public set normals(newNormals: Array<number> | undefined) {
        this._normals.data = newNormals;
    }

    public get colors(): Array<number> | undefined {
        return this._colors.data;
    }

    public set colors(newColors: Array<number> | undefined) {
        this._colors.data = newColors;
    }

    public get uv(): Array<number> | undefined {
        return this._uv.data;
    }

    public set uv(newUV: Array<number> | undefined) {
        this._uv.data = newUV;
    }

    public get verticesLength(): number {
        return this._vertices.length;
    }

    public get indicesLength(): number {
        return this._indices.length;
    }

    public get normalsLength(): number {
        return this._normals.length;
    }

    public get colorsLength(): number {
        return this._colors.length;
    }

    public get uvLength(): number {
        return this._uv.length;
    }

    public get vertexData(): Float32Array {
        return new Float32Array(this.hasVertices ? this._vertices.data : Mesh._EMPTY);
    }

    public get indexData(): Uint32Array {
        return new Uint32Array(this.hasIndices ? this._indices.data : Mesh._EMPTY);
    }

    public get normalData(): Float32Array {
        return new Float32Array(this.hasNormals ? this._normals.data : Mesh._EMPTY);
    }

    public get colorData(): Float32Array {
        return new Float32Array(this.hasColors ? this._colors.data : Mesh._EMPTY);
    }

    public get uvData(): Float32Array {
        return new Float32Array(this.hasUV ? this._uv.data : Mesh._EMPTY);
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
        const buff: Array<number> = this._vertices.cleanData;

        for (let i = 0; i < length; i++) {
            const vec: Vector3 = verts[i];

            buff.push(vec.x);
            buff.push(vec.y);
            buff.push(vec.z);
        }

        this.vertices = buff;

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
        const buff: Array<number> = this._indices.cleanData;

        for (let i = 0; i < length; i++) {
            buff.push(indices[i]);
        }

        this.indices = buff;

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
        const buff: Array<number> = this._colors.cleanData;

        for (let i = 0; i < length; i++) {
            const color: Color = colors[i];

            buff.push(color.r);
            buff.push(color.g);
            buff.push(color.b);
            buff.push(color.a);
        }

        this.colors = buff;

        return this;
    }

    public _upload() {
        const renderer: Renderer = Renderer.instance;

        if (!renderer.valid) {
            throw new Error("Mesh._uploadVertices() - unable to upload data to gpu as Renderer instance is not valid");
        }

        const gl: WebGL2RenderingContext = renderer.gl;

        this.uploadVertices(gl);
        this.uploadNormals(gl);
        this.uploadColors(gl);
        this.uploadUV(gl);
    }

    private uploadVertices(gl: WebGL2RenderingContext) {
        // do nothing if no vertices are available
        if (!this.hasVertices || !this.hasIndices) {
            return;
        }

        const vbuffer: WebGLBuffer = this._vertices.buffer || gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);

        this._vertices.buffer = vbuffer;

        const ibuffer: WebGLBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexData, gl.STATIC_DRAW);

        this._indices.buffer = ibuffer;
    }

    private uploadColors(gl: WebGL2RenderingContext) {
        // do nothing if no colors are available
        if (!this.hasColors) {
            return;
        }

        const buffer: WebGLBuffer = this._colors.buffer || gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colorData, gl.STATIC_DRAW);

        this._colors.buffer = buffer;
    }

    private uploadNormals(gl: WebGL2RenderingContext) {
        // do nothing if no normals are available
        if (!this.hasNormals) {
            return;
        }

        const buffer: WebGLBuffer = this._normals.buffer || gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normalData, gl.STATIC_DRAW);

        this._normals.buffer = buffer;
    }

    private uploadUV(gl: WebGL2RenderingContext) {
        // do nothing if no uv are available
        if (!this.hasUV) {
            return;
        }

        const buffer: WebGLBuffer = this._uv.buffer || gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvData, gl.STATIC_DRAW);

        this._uv.buffer = buffer;
    }

    /**
     * Destroy/Free all GPU resources for this Mesh
     */
    public destroy() {
        const renderer: Renderer = Renderer.instance;

        if (!renderer.valid) {
            throw new Error("Mesh.destroy() - unable to delete mesh data as Renderer instance is not valid");
        }

        const gl: WebGL2RenderingContext = renderer.gl;

        this._vertices.destroy(gl);
        this._indices.destroy(gl);
        this._colors.destroy(gl);
        this._uv.destroy(gl);
        this._normals.destroy(gl);
    }
}