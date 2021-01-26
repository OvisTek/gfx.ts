import { Vector3 } from "../../math/vector3";
import { Color } from "../../math/color";
import { Material } from "../shader/material";
import { Shader } from "../shader/shader";
import { Attribute } from "../shader/attribute";
import { Renderer } from "../renderer";
import { DataBuffer, DataBufferType } from "./data-buffer";

/**
 * Allows to supply optional shared DataBuffer to be used by this mesh
 */
export interface MeshOptions {
    readonly vertexBuffer?: DataBuffer;
    readonly indexBuffer?: DataBuffer;
    readonly normalBuffer?: DataBuffer;
    readonly uvBuffer?: DataBuffer;
    readonly colorBuffer?: DataBuffer;
}

/**
 * Represents an Indexed Mesh for 3D Rendering
 */
export class Mesh {
    private readonly _vertices: DataBuffer;
    private readonly _indices: DataBuffer;
    private readonly _normals: DataBuffer;
    private readonly _colors: DataBuffer;
    private readonly _uv: DataBuffer;

    private _vao?: WebGLVertexArrayObject;

    constructor(options: MeshOptions = {}) {
        const gl: WebGL2RenderingContext = Renderer.instance.context.gl;

        // setup vertices as either a shared buffer or a new buffer
        this._vertices = options.vertexBuffer ?? new DataBuffer({
            bufferType: DataBufferType.FLOAT32,
            drawType: gl.STATIC_DRAW,
            dataType: gl.ARRAY_BUFFER,
            components: 3,
            normalise: false
        });

        // setup indices as either a shared buffer or a new buffer
        this._indices = options.indexBuffer ?? new DataBuffer({
            bufferType: DataBufferType.UINT16,
            drawType: gl.STATIC_DRAW,
            dataType: gl.ELEMENT_ARRAY_BUFFER,
            components: 0,
            normalise: false
        });

        // setup normals as either a shared buffer or a new buffer
        this._normals = options.normalBuffer ?? new DataBuffer({
            bufferType: DataBufferType.FLOAT32,
            drawType: gl.STATIC_DRAW,
            dataType: gl.ARRAY_BUFFER,
            components: 3,
            normalise: false
        });

        // setup colors as either a shared buffer or a new buffer
        this._colors = options.colorBuffer ?? new DataBuffer({
            bufferType: DataBufferType.FLOAT32_UINT8,
            drawType: gl.STATIC_DRAW,
            dataType: gl.ARRAY_BUFFER,
            components: 4,
            normalise: true
        });

        this._uv = options.uvBuffer ?? new DataBuffer({
            bufferType: DataBufferType.FLOAT32,
            drawType: gl.STATIC_DRAW,
            dataType: gl.ARRAY_BUFFER,
            components: 2,
            normalise: false
        });

        this._vao = undefined;
    }

    public get vertices(): DataBuffer {
        return this._vertices;
    }

    public get indices(): DataBuffer {
        return this._indices;
    }

    public get normals(): DataBuffer {
        return this._normals;
    }

    public get colors(): DataBuffer {
        return this._colors;
    }

    public get uv(): DataBuffer {
        return this._uv;
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
        const buff: Array<number> = new Array<number>();

        for (let i: number = 0; i < length; i++) {
            const vec: Vector3 = verts[i];

            buff.push(vec.x);
            buff.push(vec.y);
            buff.push(vec.z);
        }

        this.vertices.dataRef = buff;

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
        const buff: Array<number> = new Array<number>();

        for (let i: number = 0; i < length; i++) {
            const vec: Vector3 = normals[i];

            buff.push(vec.x);
            buff.push(vec.y);
            buff.push(vec.z);
        }

        this.normals.dataRef = buff;

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
        const buff: Array<number> = new Array<number>();

        for (let i: number = 0; i < length; i++) {
            buff.push(indices[i]);
        }

        this.indices.dataRef = buff;

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
        const buff: Array<number> = new Array<number>();

        for (let i: number = 0; i < length; i++) {
            buff.push(colors[i].rgba8888);
        }

        this.colors.dataRef = buff;

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

        const vao: WebGLVertexArrayObject | null = this._vao || gl.createVertexArray();

        if (vao == null) {
            throw new Error("Mesh.upload() - gl.createVertexArray() failed to create VAO");
        }

        this._vao = vao;

        this.vertices.buffer();
        this.indices.buffer();
        this.normals.buffer();
        this.uv.buffer();
        this.colors.buffer();

        const verticesAttrib: string = "gfx_Position";
        const normalsAttrib: string = "gfx_Normal";
        const colorsAttrib: string = "gfx_Color";
        const uvAttrib: string = "gfx_TexCoord0";

        // record all uploaded operations into a single VAO, this way we only need to
        // bind the VAO for rendering reducing cpu-based bound operations
        gl.bindVertexArray(vao);

        if (shader.hasAttribute(verticesAttrib)) {
            this.vertices.record(shader.attribute(verticesAttrib));
            this.indices.record(shader.attribute(verticesAttrib));
        }

        if (shader.hasAttribute(normalsAttrib)) {
            this.normals.record(shader.attribute(normalsAttrib));
        }

        if (shader.hasAttribute(colorsAttrib)) {
            this.colors.record(shader.attribute(colorsAttrib));
        }

        if (shader.hasAttribute(uvAttrib)) {
            this.uv.record(shader.attribute(uvAttrib));
        }

        gl.bindVertexArray(null);
    }

    /**
     * Destroy/Free all GPU resources for this Mesh
     */
    public destroy() {
        // delete buffers if any
        this._vertices.destroy();
        this._indices.destroy();
        this._colors.destroy();
        this._uv.destroy();
        this._normals.destroy();

        // delete VAO if any
        if (this._vao !== undefined) {
            const gl: WebGL2RenderingContext = Renderer.instance.context.gl;

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