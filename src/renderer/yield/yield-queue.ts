import { SavedPromiseArray } from "../../util/saved-promise-array";
import { Renderer } from "../renderer";

/**
 * Supply so the yield operator knows when to execute stuff
 */
export enum YieldType {
    START_OF_FRAME = 0,
    END_OF_FRAME = 1
}

/**
 * Provides the ability to delay execution of an operation/function to the different
 * parts of the Rendering Pipeline
 */
export class YieldQueue {
    private readonly _queueStart: SavedPromiseArray<Renderer>;
    private readonly _queueEnd: SavedPromiseArray<Renderer>;
    private readonly _renderer: Renderer;

    constructor(renderer: Renderer) {
        this._renderer = renderer;
        this._queueStart = new SavedPromiseArray<Renderer>();
        this._queueEnd = new SavedPromiseArray<Renderer>();
    }

    /**
     * Execute an operation at the start of the next frame
     */
    public get next(): Promise<Renderer> {
        return new Promise<Renderer>((accept, reject) => {
            this._queueStart.add(accept, reject);
        });
    }

    /**
     * Execute an operation at the end of the current frame
     */
    public get last(): Promise<Renderer> {
        return new Promise<Renderer>((accept, reject) => {
            this._queueEnd.add(accept, reject);
        });
    }

    /**
     * Execute an operation at the specified point in time
     * 
     * YieldType.START_OF_FRAME - executes an operation at the start of the next frame
     * YieldType.END_OF_FRAME - executes an operation at the end of the current frame
     * 
     * @param yieldType - when the operation should execute
     */
    public exec(yieldType: YieldType = 0): Promise<Renderer> {
        switch (yieldType) {
            case YieldType.START_OF_FRAME:
                return this.next;
            case YieldType.END_OF_FRAME:
                return this.last;
            default:
                return new Promise<Renderer>((_accept, reject) => {
                    reject("YieldQueue.exec(YieldType) - supplied invalid enum of " + yieldType);
                });
        }
    }

    /**
     * Executed by the renderer at start of a frame
     */
    public _flushStart(): void {
        this._queueStart.acceptOrReject(this._renderer);
    }

    /**
     * Executed by the renderer at end of a frame
     */
    public _flushEnd(): void {
        this._queueEnd.acceptOrReject(this._renderer);
    }
}