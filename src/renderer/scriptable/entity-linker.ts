/**
 * Used for generating a unique ID for objects
 */
class ID {
    private static _counter: number = 0;

    public static generate() {
        return this._counter++;
    }
}

/**
 * Manages the Scene-Graph of Entities.
 * 
 * This is a generic class extended by Entity
 */
export abstract class EntityLinker<T> {
    private readonly _id: number;
    // the parent of this object (if any)
    // if undefined, then this object is not part of the scene-graph
    private _parent?: EntityLinker<T>;

    // all the child objects of this entity
    private _children: Array<EntityLinker<T>>;

    constructor() {
        this._parent = undefined;
        this._children = new Array<EntityLinker<T>>();
        this._id = ID.generate();
    }

    /**
     * Returns the current parent of this object
     */
    public get parent(): EntityLinker<T> | undefined {
        return this._parent;
    }

    /**
     * Returns all the children of this object
     */
    public get children(): Array<EntityLinker<T>> {
        return this._children;
    }

    /**
     * Returns a Unique ID of this object
     */
    public get id(): number {
        return this._id;
    }

    /**
     * Sets a new parent for this object. If this object has a previous parent, it will
     * be removed from the existing hierarchy and placed onto the new one
     */
    public set parent(newParent: EntityLinker<T> | undefined) {
        // remove ourselves from the existing parent
        this.pop();

        this._parent = newParent;

        // add ourselves as a child of the new parent
        if (this._parent) {
            this._parent._children.push(this);
        }
    }

    /**
     * Internal private function to remove ourselves from the parent
     */
    private pop(): boolean {
        // pops this object from the parent
        if (this._parent) {
            // remove itself from the parent
            const children: Array<EntityLinker<T>> = this._parent._children;

            // NOTE - This can be vastly improved to remove 
            // the O(n) to O(1) via trickery
            const index: number = children.indexOf(this);

            // resets the parent
            this._parent = undefined;

            if (index >= 0) {
                children.splice(index, 1);

                return true;
            }
        }

        return false;
    }
}