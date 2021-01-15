import { Camera } from "../camera/camera";
import { PerspectiveCamera } from "../camera/perspective-camera";
import { Renderer } from "../renderer";
import { Entity } from "../scriptable/entity";
import { StageRoot } from "./stage-root";

/**
 * The Stage represents a collection of objects as a hierarchy to be executed
 * by the Renderer. A Stage can be thought of as a single Level. 
 * 
 * Only one Stage can be active at any one time.
 */
export class Stage {
    private readonly _root: StageRoot;
    private readonly _camera: PerspectiveCamera;
    private readonly _queue: Array<Entity>;

    constructor() {
        this._root = new StageRoot();
        this._camera = new PerspectiveCamera();
        this._queue = new Array<Entity>();

        this._camera.parent = this._root;
    }

    /**
     * Returns the root object of the stage.
     * There is only a single root object
     */
    public get root(): StageRoot {
        return this._root;
    }

    /**
     * Returns the current camera/view of the Stage
     */
    public get camera(): Camera {
        return this._camera;
    }

    /**
     * Queue a new object instance for creation
     * 
     * @param instance The object instance to be created
     */
    public queue<T extends Entity>(instance: T): Promise<T> {
        return new Promise<T>((accept, reject) => {
            instance._exec_Create(this).then(() => {
                this._queue.push(instance);
                accept(instance);
            }).catch(reject);
        });
    }

    /**
     * Called automatically by the renderer when viewport size is changed
     * 
     * @param newWidth - The new width of the renderer
     * @param newHeight - The new height of the renderer
     */
    public _resize(newWidth: number, newHeight: number) {
        this._camera.width = newWidth;
        this._camera.height = newHeight;
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
                const startResult: Error | undefined = newObject._exec_Start();

                if (startResult != undefined) {
                    console.error(startResult);

                    renderer.pause();

                    return;
                }

                newObject = this._queue.pop();
            }
        }

        const gl: WebGL2RenderingContext = renderer.gl;
        const root: StageRoot = this._root;

        // start a new GL frame render
        gl.clearColor(0.5, 0.5, 0.5, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // execute root that will recursively execute all child objects
        const updateResult: Error | undefined = root._exec_Update(deltaTime);

        if (updateResult != undefined) {
            console.error(updateResult);

            renderer.pause();

            return;
        }

        const lateUpdateResult: Error | undefined = root._exec_LateUpdate(deltaTime);

        if (lateUpdateResult != undefined) {
            console.error(updateResult);

            renderer.pause();
        }
    }
}