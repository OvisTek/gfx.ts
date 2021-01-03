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

    constructor() {
        this._root = new StageRoot();
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
                accept(instance);
            }).catch(reject);
        });
    }
}