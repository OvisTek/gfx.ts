import { GLContext } from "./gl-context";
import { Stage } from "./stage/stage";
import { YieldQueue } from "./yield/yield-queue";

/**
 * Renderer is a singleton type that can be accessed from anywhere in the application.
 * Only a single instance of this class exists. Use Renderer.instance to access.
 * 
 * Renderer manages the global event loop and all required callbacks. 
 */
export class Renderer {
    private static readonly _instance: Renderer = new Renderer();

    // NOTE: This might have to change away from read-only to allow
    // users to create multiple stages or levels to be loaded/unloaded
    private readonly _stage: Stage;

    // GL Contexts
    private readonly _context: GLContext;
    private readonly _yield: YieldQueue;
    private _devMode: boolean;
    private _isPaused: boolean;
    private _isStarted: boolean;

    // Window Sizes
    private _width: number;
    private _height: number;

    private constructor() {
        this._stage = new Stage();
        this._context = new GLContext();
        this._yield = new YieldQueue(this);
        this._devMode = false;
        this._isPaused = false;
        this._isStarted = false;
        this._width = 1024;
        this._height = 1024;
    }

    public get stage(): Stage {
        return this._stage;
    }

    /**
     * Checks if the Renderer is setup properly
     */
    public get valid(): boolean {
        return this._context.valid;
    }

    /**
     * Choose how to handle error, this could be piped to a user-friendly context
     * 
     * @param error - the error to handle (if any)
     */
    public errorOrPass(error: Error | string | undefined): void {
        if (error == undefined) {
            return;
        }

        console.error(error);

        // only pause on dev-mode
        if (this.devMode) {
            this.pause();
        }
    }

    /**
     * Enable/Disable more strict checking for certain engine routines. This is good
     * for development mode to make sure everything is running correctly. Some parts of
     * the engine will run slower so this should be disabled for production.
     * 
     * Disabled by default
     */
    public get devMode(): boolean {
        return this._devMode;
    }

    public set devMode(value: boolean) {
        this._devMode = value;
    }

    /**
     * Checks if the Renderer is paused or running
     */
    public get paused(): boolean {
        return this._isPaused;
    }

    public get yield(): YieldQueue {
        return this._yield;
    }

    public pause(): void {
        this._isPaused = true;

        // TO-DO propogate onPause event to stage
    }

    public resume(): void {
        this._isPaused = false;

        // TO-DO propogate onResume event to stage
    }

    public start(): void {
        if (this._isStarted) {
            return;
        }

        if (!this.valid) {
            throw new Error("Renderer.start() - cannot start as Renderer state is invalid, suggest calling Renderer.init()");
        }

        this._isStarted = true;

        // start the main looper
        window.requestAnimationFrame(this.loop);
    }

    /**
     * Returns the Canvas element being used by this Renderer
     */
    public get context(): GLContext {
        return this._context;
    }

    /**
     * Initialise the Renderer provided a Canvas
     * 
     * @param canvas - The HTML Canvas to load
     */
    public init(canvas: HTMLCanvasElement): void {
        const gl: WebGL2RenderingContext | null = canvas.getContext('webgl2');

        if (!gl) {
            throw new Error("Renderer.init(HTMLCanvasElement) - webgl2 is not supported");
        }

        this._context.setup(gl, canvas);

        const oldWidth: number = this._width;
        const oldHeight: number = this._height;

        this._width = canvas.width;
        this._height = canvas.height;

        if (this._width != oldWidth || this._height != oldHeight) {
            this.stage._resize(this._width, this._height);
        }
    }

    public get width(): number {
        return this.width;
    }

    public get height(): number {
        return this._height;
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
            throw new Error("Renderer.initWithID(string) - canvas with ID of " + canvasID + " could not be found");
        }

        this.init(canvas);
    }

    /**
     * Access the one and only Global Renderer instance
     */
    public static get instance(): Renderer {
        return Renderer._instance;
    }

    // used for calculating the delta-time
    private _lastTime: number = -1;

    /**
     * internal loop function
     */
    private readonly loop = (currentTime: number) => {
        window.requestAnimationFrame(this.loop);

        if (this._lastTime <= -1) {
            this._lastTime = currentTime;
        }

        // deltatime in seconds
        const deltaTime: number = (currentTime - this._lastTime) * 0.001;

        this._lastTime = currentTime;

        if (!this._isPaused) {
            // execute scripts that want to execute at start of the frame
            this._yield._flushStart();

            // update the current active stage
            this.stage._update(deltaTime, this);

            // execute scripts that want to execute at end of the frame
            this._yield._flushEnd();
        }
    }
}