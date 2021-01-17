import { Renderer, RenderOperable } from "../renderer";
import { Uniform } from "./uniform";

export class Texture implements RenderOperable {
    private readonly _image: HTMLImageElement;
    private readonly _url: string;
    private _texture?: WebGLTexture;

    constructor(url: string) {
        this._image = new Image();
        this._url = url;
        this._texture = undefined;
    }

    /**
     * Asynchronously loads a texture from the provided url
     * 
     * @param url - the url to load the texture from
     */
    public load(): Promise<Texture> {
        return new Promise<Texture>((accept, reject) => {
            const image: HTMLImageElement = this._image;

            image.onload = () => {
                Renderer.instance.queueOperation(this).then(() => {
                    accept(this);
                }).catch(reject);
            };

            image.onerror = () => {
                reject(new Error("Texture.load(string) - failed to load image at url " + this._url));
            }

            image.src = this._url;
        });
    }

    /**
     * Called by the rendering engine once at the start of the frame. See
     * load() functionality for how this operation is queued.
     * 
     * @param gl - the gl context passed by the rendering engine
     */
    executeOnce(gl: WebGL2RenderingContext): void {
        const texture: WebGLTexture | null = gl.createTexture();

        if (texture == null) {
            throw new Error("Texture.executeOnce(gl) - failed gl.createTexture()");
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // upload texture to the GPU
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._image);

        this._texture = texture;
    }

    /**
     * Bind and use this texture for drawing/rendering
     */
    public bind(gl: WebGL2RenderingContext, uniform: Uniform, unit: number = 0): void {
        if (this._texture == undefined) {
            return;
        }

        gl.uniform1i(uniform.location, unit);
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
    }

    /**
     * Destroy the GL image and free memory
     */
    public destroy(): void {
        const renderer: Renderer = Renderer.instance;

        if (!renderer.valid) {
            throw new Error("Texture.destroy() - unable to delete texture as Renderer instance is not valid");
        }

        const gl: WebGL2RenderingContext = renderer.gl;

        if (this._texture != undefined) {
            gl.deleteTexture(this._texture);
        }

        this._texture = undefined;
    }
}