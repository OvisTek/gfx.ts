import { Stage } from "./stage/stage";

/**
 * Renderer is a singleton type that can be accessed from anywhere in the application.
 * Only a single instance of this class exists. Use Renderer.instance to access.
 * 
 * Renderer manages the global event loop and all required callbacks. 
 */
export class Renderer {
    private static _instance: Renderer;

    // NOTE: This might have to change away from read-only to allow
    // users to create multiple stages or levels to be loaded/unloaded
    private readonly _stage: Stage;

    // GL Contexts
    private _canvas?: HTMLCanvasElement;
    private _gl?: WebGL2RenderingContext;

    private constructor() {
        this._stage = new Stage();
    }

    public get stage(): Stage {
        return this._stage;
    }

    /**
     * Checks if the Renderer is setup properly
     */
    public get valid(): boolean {
        if (!this._canvas || !this._gl) {
            return false;
        }

        return true;
    }

    /**
     * Returns the Canvas element being used by this Renderer
     */
    public get canvas(): HTMLCanvasElement {
        if (!this._canvas) {
            throw new Error("Renderer.canvas - property not set, suggest calling Renderer.init()");
        }

        return this._canvas;
    }

    /**
     * Returns the GL element being used by this Renderer
     */
    public get gl(): WebGL2RenderingContext {
        if (!this._gl) {
            throw new Error("Renderer.gl - property not set, suggest calling Renderer.init()");
        }

        return this._gl;
    }

    /**
     * Initialise the Renderer provided a Canvas
     * 
     * @param canvas - The HTML Canvas to load
     */
    public init(canvas: HTMLCanvasElement): void {
        const gl: WebGL2RenderingContext = canvas.getContext('webgl2');

        if (!gl) {
            throw new Error("Renderer.init(HTMLCanvasElement) - webgl2 is not supported");
        }

        this._canvas = canvas;
        this._gl = gl;
    }

    /**
     * Initialise the Renderer provided a Canvas ID. Ensure that the Canvas element is loaded
     * before calling this function
     * 
     * @param canvasID - The HTML Canvas id to load
     */
    public initWithID(canvasID: string): void {
        const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(canvasID);

        if (!canvas) {
            throw new Error("Renderer.initWithID(String) - canvas with ID of " + canvasID + " could not be found");
        }

        this.init(canvas);
    }

    /**
     * Access the one and only Renderer instance
     */
    public static get instance(): Renderer {
        if (!Renderer._instance) {
            Renderer._instance = new Renderer();
        }

        return Renderer._instance;
    }
}