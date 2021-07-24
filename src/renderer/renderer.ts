import { Input } from "../input/input";
import { Stage } from "./stage/stage";
import { YieldQueue } from "./yield/yield-queue";
import { WebGLRenderer } from "three";

/**
 * Renderer is a singleton type that can be accessed from anywhere in the application.
 * Only a single instance of this class exists. Use Renderer.instance to access.
 * 
 * Renderer manages the global event loop and all required callbacks. 
 */
export class Renderer {
    private static readonly _INSTANCE: Renderer = new Renderer();

    private readonly _yield: YieldQueue;
    private _threeRenderer: WebGLRenderer | null;
    private _stage: Stage | null;

    private _devMode: boolean;
    private _isPaused: boolean;
    private _isStarted: boolean;

    // Window Sizes
    private _width: number;
    private _height: number;

    private constructor() {
        this._yield = new YieldQueue(this);
        this._threeRenderer = null;
        this._stage = null;
        this._devMode = false;
        this._isPaused = false;
        this._isStarted = false;
        this._width = 1024;
        this._height = 1024;
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
        if (this._stage && destroyOldStage) {
            this._stage._destroy(this);
        }

        this._stage = stage;
    }

    /**
     * Choose how to handle error, this could be piped to a user-friendly context
     * 
     * @param error - the error to handle (if any)
     */
    public errorOrPass(error: Error | string | undefined | null): void {
        if (error === undefined || error === null) {
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

    public get yield(): YieldQueue {
        return this._yield;
    }

    public pause(): void {
        this._isPaused = true;

        Input.instance.pause();

        // TO-DO propogate onPause event to stage
    }

    public resume(): void {
        this._isPaused = false;

        Input.instance.resume();

        // TO-DO propogate onResume event to stage
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
    public init(canvas: HTMLCanvasElement | undefined | null): void {
        if (canvas === undefined || canvas === null) {
            throw new Error("Renderer.init(HTMLCanvasElement) - unable to initialise as argument was undefined or null");
        }

        this._threeRenderer = new WebGLRenderer({
            canvas: canvas,
            alpha: false,
            antialias: true
        });

        // ensure the input system is listening for events from the rendering canvas
        Input.instance.setup(canvas);

        this._width = canvas.width;
        this._height = canvas.height;
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
    public initWithID(canvasID: string): void {
        const canvas: HTMLCanvasElement = document.getElementById(canvasID) as HTMLCanvasElement;

        if (!canvas) {
            throw new Error("Renderer.initWithID(string) - canvas with ID of " + canvasID + " could not be found");
        }

        this.init(canvas);
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