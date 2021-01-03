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
    private readonly _queue: Array<Entity>;

    constructor() {
        this._root = new StageRoot();
        this._queue = new Array<Entity>();
    }

    /**
     * Returns the root object of the stage.
     * There is only a single root object
     */
    public get root(): StageRoot {
        return this._root;
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
     * Called automatically every frame by the Renderer
     * 
     * @param deltaTime The time difference between last and current frame in seconds
     */
    public _update(deltaTime: number) {
        // check the current queue for any new objects that need to be started
        if (this._queue.length > 0) {
            let newObject: Entity | undefined = this._queue.pop();

            // loop until the queue is completely empty
            while (newObject) {
                newObject._exec_Start();

                newObject = this._queue.pop();
            }
        }

        const root: StageRoot = this._root;

        // execute root that will recursively execute all child objects
        root._exec_Update(deltaTime);
        root._exec_LateUpdate(deltaTime);
    }
}