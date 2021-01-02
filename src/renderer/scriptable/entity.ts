import { Stage } from "../stage/stage";
import { Transform } from "../transform";
import { EntityLinker } from "./entity-linker";

/**
 * Everything extends the StageObject as a base class. Contains a number of 
 * callbacks from the main renderer
 */
export abstract class Entity extends EntityLinker<Entity> {
    // this is where the stage object will be rendered in the scene
    private readonly _transform: Transform;

    private _stage?: Stage;
    private _visibility: boolean;

    constructor(isInitiallyVisible: boolean = true) {
        super();
        this._transform = new Transform();
        this._stage = undefined;
        this._visibility = isInitiallyVisible;
    }

    /**
     * Adds a new child to the provided StageObject. Returns a Promise that
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
            throw new Error("StageObject.stage() - object was not setup correctly, context unavailable");
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