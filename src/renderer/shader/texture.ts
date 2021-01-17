import { Renderer, RenderOperable } from "../renderer";
import { Uniform } from "./uniform";

export class Texture implements RenderOperable {
    private readonly _image: HTMLImageElement;
    private readonly _url: string;

    constructor(url: string) {
        this._image = new Image();
        this._url = url;
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
        throw new Error("Method not implemented.");
    }

    /**
     * Bind and use this texture for drawing/rendering
     */
    public bind(uniform: Uniform) {

    }
}