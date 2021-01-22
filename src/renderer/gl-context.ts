export class GLContext {
    private _gl?: WebGL2RenderingContext;
    private _canvas?: HTMLCanvasElement;

    constructor() {
        this._gl = undefined;
        this._canvas = undefined;
    }

    public get valid(): boolean {
        return this._gl !== undefined;
    }

    public get gl(): WebGL2RenderingContext {
        if (this._gl === undefined) {
            throw new Error("GLContext.gl - context was not setup properly, cannot access gl");
        }

        return this._gl;
    }

    public get canvas(): HTMLCanvasElement {
        if (this._canvas === undefined) {
            throw new Error("GLContext.canvas - context was not setup properly, cannot access canvas");
        }

        return this._canvas;
    }

    public setup(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
        this._gl = gl;
        this._canvas = canvas;
    }
}