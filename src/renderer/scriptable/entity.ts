import { Stage } from "../stage/stage";
import { Transform } from "../transform";

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
 * Everything extends the Entity as a base class. Contains a number of 
 * callbacks from the main renderer
 */
export abstract class Entity {
    // this is where the stage object will be rendered in the scene
    private readonly _transform: Transform;
    private readonly _id: number;

    // all the child objects of this entity
    private readonly _children: Array<Entity>;

    private _stage?: Stage;
    private _visibility: boolean;

    // the parent of this object (if any)
    // if undefined, then this object is not part of the scene-graph
    private _parent?: Entity;

    constructor(isInitiallyVisible: boolean = true) {
        this._stage = undefined;
        this._parent = undefined;

        this._transform = new Transform();
        this._visibility = isInitiallyVisible;
        this._children = new Array<Entity>();
        this._id = ID.generate();
    }

    /**
     * Returns the current parent of this object
     */
    public get parent(): Entity | undefined {
        return this._parent;
    }

    /**
     * Returns all the children of this object
     */
    public get children(): Array<Entity> {
        return this._children;
    }

    /**
     * Returns a Unique ID of this object
     */
    public get id(): number {
        return this._id;
    }

    /**
     * Returns the current local visibility of this object
     * NOTE: This may return true however object may be invisible due to parent.
     * To see if the object is globally visible, query the globalVisible object
     */
    public get visibility(): boolean {
        return this._visibility;
    }

    /**
     * Checks the global visibility of the object.
     */
    public get globalVisibility(): boolean {
        const localVisibility: boolean = this.visibility;

        if (!this._parent) {
            return localVisibility;
        }

        // if local visibility is false, then no way children are being rendered
        if (localVisibility == false) {
            return localVisibility;
        }

        // query the parent visibility to ensure propagation to the root
        return this._parent.globalVisibility;
    }

    /**
     * Sets the local visibility of this object.
     * NOTE: This may be set to true however object may be invisible due to parent.
     * To see if the object is globally visible, query the globalVisible object
     */
    public set visibility(isVisible: boolean) {
        this._visibility = isVisible;
    }

    /**
     * Sets a new parent for this object. If this object has a previous parent, it will
     * be removed from the existing hierarchy and placed onto the new one
     */
    public set parent(newParent: Entity | undefined) {
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
            const children: Array<Entity> = this._parent._children;

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

    /**
     * Adds a new child to the provided Entity. Returns a Promise that
     * will resolve when the child object is loaded and will be executed.
     * 
     * @param instance The instance of the new object to add to this hierarchy
     */
    public add<T extends Entity>(instance: T): Promise<T> {
        return this.stage.add(instance, this);
    }

    /**
     * Called by the Rendering Engine to construct this object asynchronously. Object
     * will not be executed/rendered until the promise is resolved
     */
    protected create(): Promise<void> {
        return new Promise((accept, reject) => {
            return accept();
        });
    }

    /**
     * Returns the Stage that this object is attached to
     */
    protected get stage(): Stage {
        if (!this._stage) {
            throw new Error("Entity.stage() - object was not setup correctly, context unavailable");
        }

        return this._stage;
    }

    /**
     * Returns the Transform that allows moving, rotating or scaling this object
     */
    protected get transform(): Transform {
        return this._transform;
    }

    /**
     * Called by the Rendering Engine just before a rendering is about to be done
     * 
     * @param deltaTime The time difference between the last and current frame in seconds
     */
    protected update(deltaTime: number) { }

    /**
     * Called by the Rendering Engine just after a rendering was done
     * 
     * @param deltaTime The time difference between the last and current frame in seconds
     */
    protected lateUpdate(deltaTime: number) { }

    /**
     * Called by the Rendering Engine when it was paused by a user or a script
     */
    protected onPause() { }

    /**
     * Called by the Rendering Engine when it was resumed from a previously paused state
     */
    protected onResume() { }

    /**
     * Called by the Rendering Engine when this object was removed from the Stage
     */
    protected onDestroy() { }

    /**
     * Called by the Rendering Engine when the Canvas/Renderer was resized to a new size
     * 
     * @param newWidth The new width of the Renderer/Canvas
     * @param newHeight The new height of the Renderer/Canvas
     */
    protected onResize(newWidth: number, newHeight: number) { }

    /**
     * Safe execution of the create() function. This should not be called from user-space
     * 
     * @param stage The Stage reference
     */
    public _exec_Create(stage: Stage, parent: Entity): Promise<void> {
        // TODO FIX
        // sets the stage reference
        this._stage = stage;
        this._parent = parent;

        return this.create();
    }

    /**
     * Safe execution of the update() function. This should not be called from user-space
     * 
     * @param deltaTime The time difference between the last and current frame in seconds
     */
    public _exec_Update(deltaTime: number): Error | undefined {
        try {
            this.update(deltaTime);
        }
        catch (error) {
            return error;
        }

        return undefined;
    }

    /**
     * Safe execution of the lateUpdate() function. This should not be called from user-space
     * 
     * @param deltaTime The time difference between the last and current frame in seconds
     */
    public _exec_LateUpdate(deltaTime: number): Error | undefined {
        try {
            this.lateUpdate(deltaTime);
        }
        catch (error) {
            return error;
        }

        return undefined;
    }

    /**
     * Safe execution of the onPause() function. This should not be called from user-space
     */
    public _exec_OnPause(): Error | undefined {
        try {
            this.onPause();
        }
        catch (error) {
            return error;
        }

        return undefined;
    }

    /**
     * Safe execution of the onResume() function. This should not be called from user-space
     */
    public _exec_OnResume(): Error | undefined {
        try {
            this.onResume();
        }
        catch (error) {
            return error;
        }

        return undefined;
    }

    /**
     * Safe execution of the onDestroy() function. This should not be called from user-space
     */
    public _exec_OnDestroy(): Error | undefined {
        try {
            this.onDestroy();
        }
        catch (error) {
            return error;
        }

        return undefined;
    }

    /**
     * Safe execution of the onResize() function. This should not be called from user-space
     * 
     * @param newWidth The new width of the Renderer/Canvas
     * @param newHeight The new height of the Renderer/Canvas
     */
    protected _exec_OnResize(newWidth: number, newHeight: number): Error | undefined {
        try {
            this.onResize(newWidth, newHeight);
        }
        catch (error) {
            return error;
        }

        return undefined;
    }
}