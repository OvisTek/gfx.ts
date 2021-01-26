import { Renderer } from "../renderer";
import { Attribute } from "../shader/attribute";

export enum DataBufferType {
    FLOAT32,
    UINT8,
    UINT16,
    UINT32,
    FLOAT32_UINT8,
}

/**
 * Interface for initialising the DataBuffer
 */
export interface DataBufferOptions {
    /**
     * The buffer type to be uploaded into the GPU
     */
    readonly bufferType: DataBufferType;

    /**
     * Either gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER
     */
    readonly dataType: number;

    /**
     * Either gl.STATIC_DRAW or gl.DYNAMIC_DRAW
     */
    readonly drawType: number;

    /**
     * The number of components for the Data. For example, vec4 would be 4
     */
    readonly components: number;

    /**
     * Should the data be normalised before uploading to the GPU
     */
    readonly normalise: boolean;
}

/**
 * Represents a DataBuffer for uploading data into the GPU. This is typically used
 * in conjunction with the Mesh
 */
export class DataBuffer {
    private readonly _options: DataBufferOptions;

    private _glBuffer: WebGLBuffer | null;
    private _data?: Array<number>;
    private _isDirty: boolean;

    constructor(options: DataBufferOptions) {
        this._options = options;
        this._glBuffer = null;
        this._isDirty = false;
    }

    /**
     * Checks if this Data Buffer is valid and contains data
     */
    public get valid(): boolean {
        return this._data !== undefined && this._data !== null && this._data.length > 0;
    }

    public get dataRef(): Array<number> | undefined {
        return this._data;
    }

    public get length(): number {
        return (this._data !== undefined && this._data !== null) ? this._data.length : 0;
    }

    public set dataRef(newData: Array<number> | undefined) {
        this._data = newData;

        // ensure new data gets uploaded
        this.setDirty();
    }

    /**
     * Sets this buffer as dirty and in need for an update
     */
    public setDirty(): void {
        this._isDirty = true;

        // always upload new stuff at the start of the next frame so
        // renderer does not flush unexpectedly mid-render, killing performance
        Renderer.instance.yield.next.then(() => {
            // make sure to only upload once per frame
            if (this._isDirty === true) {
                this.buffer();
            }
        }).catch((err) => {
            Renderer.instance.errorOrPass(err);
        });
    }

    /**
     * Called by the renderer to upload the internal data into the GPU
     */
    public buffer(): void {
        if (this._data !== undefined && this._data !== null && this._data.length > 0 && this._isDirty === true) {
            const gl: WebGL2RenderingContext = Renderer.instance.context.gl;
            const opt: DataBufferOptions = this._options;
            const vbuffer: WebGLBuffer | null = this._glBuffer ?? gl.createBuffer();

            this._glBuffer = vbuffer;

            gl.bindBuffer(opt.dataType, vbuffer);

            switch (opt.bufferType) {
                case DataBufferType.FLOAT32:
                    gl.bufferData(opt.dataType, new Float32Array(this._data), opt.drawType);
                    break;
                case DataBufferType.UINT16:
                    gl.bufferData(opt.dataType, new Uint16Array(this._data), opt.drawType);
                    break;
                case DataBufferType.UINT8:
                    gl.bufferData(opt.dataType, new Uint8Array(this._data), opt.drawType);
                    break;
                case DataBufferType.UINT32:
                    gl.bufferData(opt.dataType, new Uint32Array(this._data), opt.drawType);
                    break;
                case DataBufferType.FLOAT32_UINT8:
                    const f32uint8b: Float32Array = new Float32Array(this._data);
                    gl.bufferData(opt.dataType, new Uint8Array(f32uint8b.buffer), opt.drawType);
                    break;
                default: throw new Error("DataBuffer.buffer() - unrecognised bufferType option");
            }

            this._isDirty = false;
        }
    }

    /**
     * Called by the renderer to record the sequence of events for a VBO
     */
    public record(attribute: Attribute): void {
        if (this._glBuffer !== null) {
            const gl: WebGL2RenderingContext = Renderer.instance.context.gl;
            const opt: DataBufferOptions = this._options;

            const vbuffer: WebGLBuffer = this._glBuffer;

            gl.bindBuffer(opt.dataType, vbuffer);

            if (opt.dataType === gl.ELEMENT_ARRAY_BUFFER) {
                return;
            }

            switch (opt.bufferType) {
                case DataBufferType.FLOAT32:
                    gl.vertexAttribPointer(attribute.location, opt.components, gl.FLOAT, opt.normalise, 0, 0);
                    break;
                case DataBufferType.UINT16:
                    gl.vertexAttribPointer(attribute.location, opt.components, gl.UNSIGNED_SHORT, opt.normalise, 0, 0);
                    break;
                case DataBufferType.FLOAT32_UINT8:
                case DataBufferType.UINT8:
                    gl.vertexAttribPointer(attribute.location, opt.components, gl.UNSIGNED_BYTE, opt.normalise, 0, 0);
                    break;
                case DataBufferType.UINT32:
                    gl.vertexAttribPointer(attribute.location, opt.components, gl.UNSIGNED_INT, opt.normalise, 0, 0);
                    break;
                default: throw new Error("DataBuffer.record(Attribute) - unrecognised bufferType option");
            }

            gl.enableVertexAttribArray(attribute.location);
        }
    }

    /**
     * Destroys the buffer and frees GPU and CPU memory
     */
    public destroy(): void {
        const gl: WebGL2RenderingContext = Renderer.instance.context.gl;

        if (this._glBuffer !== null) {
            gl.deleteBuffer(this._glBuffer);
        }

        this._glBuffer = null;
        this._data = undefined;
    }
}