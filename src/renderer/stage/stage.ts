import { Renderer } from "../renderer";
import { Entity } from "./entity";

/**
 * The Stage represents a collection of objects as a hierarchy to be executed
 * by the Renderer. A Stage can be thought of as a single Level. 
 * 
 * Only one Stage can be active at any one time.
 */
export abstract class Stage {
    private readonly _objects: Array<Entity>;
    private readonly _queue: Array<Entity>;

    constructor() {
        this._queue = new Array<Entity>();
        this._objects = new Array<Entity>();
    }

    /**
     * Queue a new object instance for creation
     * 
     * @param instance The object instance to be created
     */
    public queue<T extends Entity>(instance: T): Promise<T> {
        return new Promise<T>((accept, reject) => {
            if (instance.isCreated) {
                return reject(new Error("Stage.queue(instance) - queued entity is already created and cannot be re-created"));
            }

            // add the object to the overall objects pool
            this._objects.push(instance);

            // otherwise, execute this objects create() function at the start
            // of the next render loop
            Renderer.instance.yield.next.then((_renderer) => {
                instance._onCreate(this).then(() => {
                    this._queue.push(instance);

                    accept(instance);
                }).catch(reject);
            }).catch(reject);
        });
    }

    /**
     * Called automatically by the renderer when viewport size is changed
     * 
     * @param newWidth - The new width of the renderer
     * @param newHeight - The new height of the renderer
     */
    public _resize(newWidth: number, newHeight: number): void {

    }

    public _pause(): void {

    }

    public _resume(): void {

    }

    /**
     * Called automatically every frame by the Renderer
     * 
     * @param deltaTime The time difference between last and current frame in seconds
     */
    public _update(deltaTime: number, renderer: Renderer) {
        // check the current queue for any new objects that need to be started
        if (this._queue.length > 0) {
            let newObject: Entity | undefined = this._queue.pop();

            // loop until the queue is completely empty
            while (newObject) {
                renderer.errorOrPass(newObject._execStart());

                newObject = this._queue.pop();
            }
        }

        const gl: WebGL2RenderingContext = renderer.context.gl;
        const root: StageRoot = this._root;

        // start a new GL frame render
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // execute root that will recursively execute all child objects
        renderer.errorOrPass(root._execUpdate(deltaTime));
        renderer.errorOrPass(root._execLateUpdate(deltaTime));
    }
}