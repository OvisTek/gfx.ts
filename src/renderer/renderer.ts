import { Input } from "../input/input";
import { Stage } from "./stage/stage";
import { YieldQueue } from "./yield/yield-queue";
import { Vector2, WebGLRenderer } from "three";

export interface RendererOptions {
    antialias: boolean,
    alpha: boolean,
    fullscreen: boolean
}

/**
 * Renderer is a singleton type that can be accessed from anywhere in the application.
 * Only a single instance of this class exists. Use Renderer.instance to access.
 * 
 * Renderer manages the global event loop and all required callbacks. 
 */
export class Renderer {
    private static readonly _DEFAULT_OPT: RendererOptions = {
        antialias: true,
        alpha: false,
        fullscreen: true
    };

    private static readonly _RENDERER_SIZE: Vector2 = new Vector2();

    private static readonly _INSTANCE: Renderer = new Renderer();

    private readonly _yield: YieldQueue;
    private readonly _fullScreenListener: any;

    private _threeRenderer: WebGLRenderer | null;
    private _threeCanvas: HTMLCanvasElement | null;
    private _stage: Stage | null;

    private _devMode: boolean;
    private _isPaused: boolean;
    private _isStarted: boolean;
    private _isFullscreen: boolean;

    // Window Sizes
    private _width: number;
    private _height: number;

    private constructor() {
        this._fullScreenListener = (_event: UIEvent) => {
            this.resize(window.innerWidth, window.innerHeight);
        };

        this._yield = new YieldQueue(this);
        this._threeRenderer = null;
        this._threeCanvas = null;
        this._stage = null;
        this._devMode = false;
        this._isPaused = false;
        this._isStarted = false;
        this._width = window.innerWidth;
        this._height = window.innerHeight;
        this._isFullscreen = false;
    }

    public get threeRenderer(): WebGLRenderer {
        if (this._threeRenderer) {
            return this._threeRenderer;
        }

        throw new Error("Renderer.threeRenderer - invalid access, object has not been constructed yet");
    }

    public get canvas(): HTMLCanvasElement {
        if (this._threeCanvas) {
            return this._threeCanvas;
        }

        throw new Error("Renderer.canvas - invalid access, object has not been constructed yet");
    }

    public get stage(): Stage {
        if (this._stage) {
            return this._stage;
        }

        throw new Error("Renderer.stage - invalid access, stage is null, the object has not been constructed yet");
    }

    public set stage(stage: Stage) {
        this.setStage(stage);
    }

    public setStage(stage: Stage, destroyOldStage: boolean = true) {
        // destroy the old stage if its still active
        if (this._stage) {
            if (this._stage.is(stage)) {
                throw new Error("Renderer.setStage(Stage, boolean) - cannot replace current stage as instances are the same");
            }

            if (destroyOldStage) {
                this._stage._destroy(this);
            }
        }

        this._stage = stage;
    }

    /**
     * Choose how to handle error, this could be piped to a user-friendly context
     * 
     * @param error - the error to handle (if any)
     */
    public errorOrPass(error: Error | string | undefined | null): void {
        if (!error) {
            return;
        }

        // only pause on dev-mode
        if (this.devMode) {
            this.pause();
        }

        console.error(error);
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

    /**
     * Check if the Renderer has started running
     */
    public get started(): boolean {
        return this._isStarted;
    }

    public get yield(): YieldQueue {
        return this._yield;
    }

    public pause(): void {
        this._isPaused = true;

        Input.instance.pause();

        if (this._stage) {
            this._stage._pause(this);
        }
    }

    public resume(): void {
        this._isPaused = false;

        Input.instance.resume();

        if (this._stage) {
            this._stage._resume(this);
        }
    }

    public start(): void {
        if (this._isStarted) {
            return;
        }

        if (!this._threeRenderer) {
            throw new Error("Renderer.start() - cannot start as Renderer state is invalid, suggest calling Renderer.init()");
        }

        this._isStarted = true;

        // start the main looper
        window.requestAnimationFrame(this.loop);
    }

    /**
     * Initialise the Renderer provided a Canvas
     * 
     * @param canvas - The HTML Canvas to load
     */
    public init(canvas: HTMLCanvasElement | undefined | null, options: RendererOptions | undefined | null = null): void {
        if (!canvas) {
            throw new Error("Renderer.init(HTMLCanvasElement) - unable to initialise as argument was undefined or null");
        }

        const opt: RendererOptions = options || Renderer._DEFAULT_OPT;

        this._threeRenderer = new WebGLRenderer({
            canvas: canvas,
            alpha: opt.alpha,
            antialias: opt.antialias
        });

        // sets the canvas instance
        this._threeCanvas = canvas;

        // sets the fullscreen options
        this.fullscreen = opt.fullscreen;

        // ensure the input system is listening for events from the rendering canvas
        Input.instance.setup(canvas);

        // in-case renderer not full-screen, we use the canvas size
        if (!this.fullscreen) {
            this.resize(canvas.width, canvas.height);
        }
    }

    public get width(): number {
        return this._width;
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
    public initWithID(canvasID: string, options: RendererOptions | undefined | null = null): void {
        const canvas: HTMLCanvasElement = document.getElementById(canvasID) as HTMLCanvasElement;

        if (!canvas) {
            throw new Error("Renderer.initWithID(string) - canvas with ID " + canvasID + " could not be found");
        }

        this.init(canvas, options);
    }

    /**
     * Ensure the Renderer is always full-screen and covers the entire
     * screen. This will automatically adjust the renderer size if the
     * screen size changes.
     */
    public get fullscreen(): boolean {
        return this._isFullscreen;
    }

    public set fullscreen(value: boolean) {
        if (this._isFullscreen === value) {
            return;
        }

        this._isFullscreen = value;

        if (value) {
            // add a listener event
            window.addEventListener("resize", this._fullScreenListener);

            this.resize(window.innerWidth, window.innerHeight);
        }
        else {
            // remove a previous listener event
            window.removeEventListener("resize", this._fullScreenListener);
        }
    }

    public resize(width: number, height: number) {
        const renderer: WebGLRenderer | null = this._threeRenderer;

        if (!renderer) {
            throw new Error("Renderer.resize(number, number) - renderer has not been initialised yet, cannot resize");
        }

        this._width = width;
        this._height = height;

        const size: Vector2 = renderer.getSize(Renderer._RENDERER_SIZE);

        if (size.x === width && size.y === height) {
            return;
        }

        renderer.setSize(width, height);

        // send callback to the scene on resize
        if (this._stage) {
            this._stage._resize(width, height, this);
        }
    }

    /**
     * Access the one and only Global Renderer instance
     */
    public static get instance(): Renderer {
        return Renderer._INSTANCE;
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
            // update the input system for keyboard/mouse events
            Input.instance.update();

            // execute scripts that want to execute at start of the frame
            this._yield._flushStart();

            // update the current active stage
            if (this._stage) {
                this._stage._update(deltaTime, this);
            }

            // execute scripts that want to execute at end of the frame
            this._yield._flushEnd();
        }
    }
}