import { Scene } from "three";
import { PerspectiveCamera } from "../camera/perspective-camera";
import { Renderer } from "../renderer";
import { Entity } from "./entity";
import { StageRoot } from "./stage-root";

/**
 * The Stage represents a collection of objects as a hierarchy to be executed
 * by the Renderer. A Stage can be thought of as a single Level. 
 * 
 * Only one Stage can be active at any one time.
 */
export abstract class Stage {
    private readonly _objects: Array<Entity>;
    private readonly _queue: Array<Entity>;
    private readonly _root: Entity;
    private readonly _camera: PerspectiveCamera;

    private readonly _threeScene: Scene;

    constructor() {
        this._queue = new Array<Entity>();
        this._objects = new Array<Entity>();

        this._root = new StageRoot(this);
        this._threeScene = new Scene();
        this._camera = new PerspectiveCamera();

        // add the root to the scene for rendering
        this._threeScene.add(this._root.transform.object);
    }

    /**
     * Access the top-most root entity for the Stage
     */
    public get root(): Entity {
        return this._root;
    }

    public get camera(): PerspectiveCamera {
        return this._camera;
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
    public _resize(newWidth: number, newHeight: number, renderer: Renderer): void {
        const objects: Array<Entity> = this._objects;
        const length: number = objects.length;

        for (let i: number = 0; i < length; i++) {
            const object: Entity = objects[i];

            try {
                object.onResize(newWidth, newHeight);
            }
            catch (error) {
                renderer.errorOrPass(error);
            }
        }
    }

    public _pause(renderer: Renderer): void {
        const objects: Array<Entity> = this._objects;
        const length: number = objects.length;

        for (let i: number = 0; i < length; i++) {
            const object: Entity = objects[i];

            try {
                object.onPause();
            }
            catch (error) {
                renderer.errorOrPass(error);
            }
        }
    }

    public _destroy(renderer: Renderer): void {
        const objects: Array<Entity> = this._objects;
        const length: number = objects.length;

        for (let i: number = 0; i < length; i++) {
            const object: Entity = objects[i];

            try {
                object.onDestroy();
            }
            catch (error) {
                renderer.errorOrPass(error);
            }
        }
    }

    public _resume(renderer: Renderer): void {
        const objects: Array<Entity> = this._objects;
        const length: number = objects.length;

        for (let i: number = 0; i < length; i++) {
            const object: Entity = objects[i];

            try {
                object.onResume();
            }
            catch (error) {
                renderer.errorOrPass(error);
            }
        }
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
                try {
                    newObject.start();

                    // add the object into the root to start rendering IF
                    // the object does not have a parent
                    if (newObject.parent === null) {
                        newObject.parent = this.root;
                    }
                }
                catch (error) {
                    renderer.errorOrPass(error);
                }

                newObject = this._queue.pop();
            }
        }

        const objects: Array<Entity> = this._objects;
        const length: number = objects.length;

        // run the update loop
        for (let i: number = 0; i < length; i++) {
            const object: Entity = objects[i];

            try {
                object.update(deltaTime);
            }
            catch (error) {
                renderer.errorOrPass(error);
            }
        }

        // perform rendering
        renderer.threeRenderer.render(this._threeScene, this._camera.threeCamera);

        // run the late update loop
        for (let i: number = 0; i < length; i++) {
            const object: Entity = objects[i];

            try {
                object.lateUpdate(deltaTime);
            }
            catch (error) {
                renderer.errorOrPass(error);
            }
        }
    }
}