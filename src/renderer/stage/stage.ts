import { StageObject } from "../scriptable/stage-object";

/**
 * This is the root object of the stage. 
 * Its just an empty container that holds all root objects.
 */
export class RootObject extends StageObject { }

export class Stage {
    private readonly _root: StageObject;

    constructor() {
        this._root = new RootObject();
    }

    /**
     * Adds a new StageObject to this Stage for execution
     * 
     * @param instance The new instance of the object to add
     * @param parent (optional) The parent of the object. If absent, this object will be added to the root
     */
    public add<T extends StageObject>(instance: T, parent: StageObject | undefined = undefined): Promise<T> {
        const root: StageObject = parent || this._root;

        return new Promise<T>((accept, reject) => {
            instance._exec_Create(this, root).then(() => {
                accept(instance);
            }).catch(reject);
        });
    }
}