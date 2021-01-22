import { Vector3 } from "../../math/vector3";
import { Color } from "../../math/color";
import { Material } from "../shader/material";
import { Shader } from "../shader/shader";
import { Attribute } from "../shader/attribute";
import { Renderer } from "../renderer";

/**
 * Represents a single MeshComponent. This is an internal class managed
 * by the Mesh system
 */
export class MeshAttribute {
    private _data?: Array<number>;
    private _buffer?: WebGLBuffer;

    constructor() {
        this._data = undefined;
        this._buffer = undefined;
    }

    public get valid(): boolean {
        return this._data !== undefined && this._data.length > 0;
    }

    public get data(): Array<number> | undefined {
        return this._data;
    }

    public set data(newData: Array<number> | undefined) {
        this._data = newData;
    }

    public get length(): number {
        return this._data !== undefined ? this._data.length : 0;
    }

    public get buffer(): WebGLBuffer {
        if (this._buffer === undefined) {
            throw new Error("MeshAttribute.buffer - attempted to access an undefined buffer");
        }

        return this._buffer;
    }

    public get bufferInstance(): WebGLBuffer | undefined {
        return this._buffer;
    }

    public set buffer(newBuffer: WebGLBuffer) {
        this._buffer = newBuffer;
    }

    public clean(): Array<number> {
        if (this._data === undefined) {
            this._data = new Array<number>();
        }

        this._data.length = 0;

        return this._data;
    }

    public destroy(gl: WebGL2RenderingContext) {
        if (this._buffer !== undefined) {
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

    private readonly _vertices: MeshAttribute;
    private readonly _indices: MeshAttribute;
    private readonly _normals: MeshAttribute;
    private readonly _colors: MeshAttribute;
    private readonly _uv: MeshAttribute;

    private _vao?: WebGLVertexArrayObject;

    constructor() {
        this._vertices = new MeshAttribute();
        this._indices = new MeshAttribute();
        this._normals = new MeshAttribute();
        this._colors = new MeshAttribute();
        this._uv = new MeshAttribute();

        this._vao = undefined;
    }

    public get vertices(): MeshAttribute {
        return this._vertices;
    }

    public get indices(): MeshAttribute {
        return this._indices;
    }

    public get normals(): MeshAttribute {
        return this._normals;
    }

    public get colors(): MeshAttribute {
        return this._colors;
    }

    public get uv(): MeshAttribute {
        return this._uv;
    }

    private get vertexData(): Float32Array {
        const data: Array<number> | undefined = this._vertices.data;

        return new Float32Array(data !== undefined ? data : Mesh._EMPTY);
    }

    private get indexData(): Uint16Array {
        const data: Array<number> | undefined = this._indices.data;

        return new Uint16Array(data !== undefined ? data : Mesh._EMPTY);
    }

    private get normalData(): Float32Array {
        const data: Array<number> | undefined = this._normals.data;

        return new Float32Array(data !== undefined ? data : Mesh._EMPTY);
    }

    private get colorData(): Uint8Array {
        const data: Array<number> | undefined = this._colors.data;
        const view: Float32Array = new Float32Array(data !== undefined ? data : Mesh._EMPTY)

        return new Uint8Array(view.buffer);
    }

    private get uvData(): Float32Array {
        const data: Array<number> | undefined = this._uv.data;

        return new Float32Array(data !== undefined ? data : Mesh._EMPTY);
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
        const buff: Array<number> = this._vertices.clean();

        for (let i: number = 0; i < length; i++) {
            const vec: Vector3 = verts[i];

            buff.push(vec.x);
            buff.push(vec.y);
            buff.push(vec.z);
        }

        this.vertices.data = buff;

        return this;
    }

    /**
     * Sets the current normals from an Array of Vector3
     * NOTE: he Vector3 array will be unpacked which could have unintended performance
     * issues at runtime. For speed use Mesh.vertices instead.
     * 
     * @param normals - The Vector3 Array to use as normals for this Mesh
     */
    public setNormals(normals: Array<Vector3>): Mesh {
        const length: number = normals.length;
        const buff: Array<number> = this._normals.clean();

        for (let i: number = 0; i < length; i++) {
            const vec: Vector3 = normals[i];

            buff.push(vec.x);
            buff.push(vec.y);
            buff.push(vec.z);
        }

        this.normals.data = buff;

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
        const buff: Array<number> = this._indices.clean();

        for (let i: number = 0; i < length; i++) {
            buff.push(indices[i]);
        }

        this.indices.data = buff;

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
        const buff: Array<number> = this._colors.clean();

        for (let i: number = 0; i < length; i++) {
            buff.push(colors[i].rgba8888);
        }

        this.colors.data = buff;

        return this;
    }

    /**
     * Upload this Mesh into the GPU
     * 
     * @param gl - the GL instance
     * @param material - the Material to be used for uploading this Mesh
     */
    public upload(gl: WebGL2RenderingContext, material: Material) {
        const shader: Shader = material.shader;

        if (this._vertices.valid && this._indices.valid) {
            this.uploadVertices(gl);
        }

        if (this._normals.valid) {
            this.uploadNormals(gl);
        }

        if (this._colors.valid) {
            this.uploadColors(gl);
        }

        if (this._uv.valid) {
            this.uploadUV(gl);
        }

        const vao: WebGLVertexArrayObject | null = this._vao || gl.createVertexArray();

        if (vao == null) {
            throw new Error("Mesh.upload() - gl.createVertexArray() failed to create VAO");
        }

        this._vao = vao;

        const verticesAttrib: string = "gfx_Position";
        const normalsAttrib: string = "gfx_Normal";
        const colorsAttrib: string = "gfx_Color";
        const uvAttrib: string = "gfx_TexCoord0";

        // record all uploaded operations into a single VAO, this way we only need to
        // bind the VAO for rendering reducing cpu-based bound operations
        gl.bindVertexArray(vao);

        if (this._vertices.valid && this._indices.valid && shader.hasAttribute(verticesAttrib)) {
            this.recordVertices(gl, shader.attribute(verticesAttrib));
        }

        if (this._normals.valid && shader.hasAttribute(normalsAttrib)) {
            this.recordNormals(gl, shader.attribute(normalsAttrib));
        }

        if (this._colors.valid && shader.hasAttribute(colorsAttrib)) {
            this.recordColors(gl, shader.attribute(colorsAttrib));
        }

        if (this._uv.valid && shader.hasAttribute(uvAttrib)) {
            this.recordUV(gl, shader.attribute(uvAttrib));
        }

        gl.bindVertexArray(null);
    }

    private uploadVertices(gl: WebGL2RenderingContext) {
        // send vertices to GPU
        const vbuffer: WebGLBuffer | null = this._vertices.bufferInstance || gl.createBuffer();

        if (vbuffer == null) {
            throw new Error("Mesh.uploadVertices() - gl.createBuffer() failed for vertices buffer");
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);

        this._vertices.buffer = vbuffer;

        // send indices to GPU
        const ibuffer: WebGLBuffer | null = this._indices.bufferInstance || gl.createBuffer();

        if (ibuffer == null) {
            throw new Error("Mesh.uploadVertices() - gl.createBuffer() failed for indices buffer");
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexData, gl.STATIC_DRAW);

        this._indices.buffer = ibuffer;
    }

    private uploadColors(gl: WebGL2RenderingContext) {
        const buffer: WebGLBuffer | null = this._colors.bufferInstance || gl.createBuffer();

        if (buffer == null) {
            throw new Error("Mesh.uploadColors() - gl.createBuffer() failed for colors buffer");
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colorData, gl.STATIC_DRAW);

        this._colors.buffer = buffer;
    }

    private uploadNormals(gl: WebGL2RenderingContext) {
        const buffer: WebGLBuffer | null = this._normals.bufferInstance || gl.createBuffer();

        if (buffer == null) {
            throw new Error("Mesh.uploadNormals() - gl.createBuffer() failed for normals buffer");
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normalData, gl.STATIC_DRAW);

        this._normals.buffer = buffer;
    }

    private uploadUV(gl: WebGL2RenderingContext) {
        const buffer: WebGLBuffer | null = this._uv.bufferInstance || gl.createBuffer();

        if (buffer == null) {
            throw new Error("Mesh.uploadUV() - gl.createBuffer() failed for uv buffer");
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvData, gl.STATIC_DRAW);

        this._uv.buffer = buffer;
    }

    private recordVertices(gl: WebGL2RenderingContext, attribute: Attribute) {
        const vbuffer: WebGLBuffer = this._vertices.buffer;

        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
        gl.vertexAttribPointer(attribute.location, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribute.location);

        const ibuffer: WebGLBuffer = this._indices.buffer;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
    }

    private recordColors(gl: WebGL2RenderingContext, attribute: Attribute) {
        const buffer: WebGLBuffer = this._colors.buffer;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(attribute.location, 4, gl.UNSIGNED_BYTE, true, 0, 0);
        gl.enableVertexAttribArray(attribute.location);
    }

    private recordNormals(gl: WebGL2RenderingContext, attribute: Attribute) {
        const buffer: WebGLBuffer = this._normals.buffer;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(attribute.location, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribute.location);
    }

    private recordUV(gl: WebGL2RenderingContext, attribute: Attribute) {
        const buffer: WebGLBuffer = this._uv.buffer;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(attribute.location, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribute.location);
    }

    /**
     * Destroy/Free all GPU resources for this Mesh
     */
    public destroy() {
        const gl: WebGL2RenderingContext = Renderer.instance.context.gl;

        // delete buffers if any
        this._vertices.destroy(gl);
        this._indices.destroy(gl);
        this._colors.destroy(gl);
        this._uv.destroy(gl);
        this._normals.destroy(gl);

        // delete VAO if any
        if (this._vao !== undefined) {
            gl.deleteVertexArray(this._vao);
        }

        this._vao = undefined;
    }

    /**
     * Bind and use this Mesh for drawing
     */
    public bind() {
        if (this._vao === undefined) {
            return;
        }

        const gl: WebGL2RenderingContext = Renderer.instance.context.gl;

        gl.bindVertexArray(this._vao);
    }

    public unbind() {
        const gl: WebGL2RenderingContext = Renderer.instance.context.gl;

        gl.bindVertexArray(null);
    }
}