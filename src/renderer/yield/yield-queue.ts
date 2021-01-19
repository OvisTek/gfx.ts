import { Renderer } from "../renderer";

/**
 * Internal class for queue and execution of RenderOperations types at start of the frame
 */
class YieldOperation {
    public readonly accept: (value: Renderer) => void;
    public readonly reject: (reason?: any) => void;

    constructor(accept: (value: Renderer) => void, reject: (reason?: any) => void) {
        this.accept = accept;
        this.reject = reject;
    }
}

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
    private readonly _queueStart: Array<YieldOperation>;
    private readonly _queueEnd: Array<YieldOperation>;
    private readonly _renderer: Renderer;

    constructor(renderer: Renderer) {
        this._renderer = renderer;
        this._queueStart = new Array<YieldOperation>();
        this._queueEnd = new Array<YieldOperation>();
    }

    /**
     * Execute an operation at the start of the next frame
     */
    public get next(): Promise<Renderer> {
        return new Promise<Renderer>((accept, reject) => {
            this._queueStart.push(new YieldOperation(accept, reject));
        });
    }

    /**
     * Execute an operation at the end of the current frame
     */
    public get last(): Promise<Renderer> {
        return new Promise<Renderer>((accept, reject) => {
            this._queueEnd.push(new YieldOperation(accept, reject));
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
    public exec(yieldType: YieldType = YieldType.START_OF_FRAME): Promise<Renderer> {
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
        this._flush(this._queueStart);
    }

    /**
     * Executed by the renderer at end of a frame
     */
    public _flushEnd(): void {
        this._flush(this._queueEnd);
    }

    /**
     * Start executing all operations in queue. This is a private internal
     * function
     * 
     * @param queue - the queue to execute
     */
    private _flush(queue: Array<YieldOperation>): void {
        // execute any operable types at start of the frame once
        if (queue.length > 0) {
            let newObject: YieldOperation | undefined = queue.pop();

            // loop until the queue is completely empty
            while (newObject) {
                try {
                    newObject.accept(this._renderer);
                }
                catch (error) {
                    newObject.reject(error);
                }

                newObject = queue.pop();
            }
        }
    }
}