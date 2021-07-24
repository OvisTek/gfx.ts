import { Stage } from "./stage";
import { Transform } from "../transform";
import { Renderer } from "../renderer";
import { Identifiable } from "../identifiable";

/**
 * Construction options for the Entity
 */
export interface EntityOptions {
    readonly visibility: boolean;
    readonly autoCreate: boolean;
}

/**
 * Everything extends the Entity as a base class. Contains a number of 
 * callbacks from the main renderer
 */
export abstract class Entity extends Identifiable {
    // default options
    private static readonly _OPT_DEFAULT: EntityOptions = { visibility: true, autoCreate: true };

    // this is where the stage object will be rendered in the scene
    private readonly _transform: Transform;
    private readonly _stage: Stage;

    constructor(opt: EntityOptions | null = null) {
        super();

        const options: EntityOptions = opt || Entity._OPT_DEFAULT;

        this._transform = new Transform(this);
        this._stage = Renderer.instance.stage;

        // automatically add this object 
        if (options.autoCreate) {
            Renderer.instance.stage.queue(this);
        }
    }

    /**
     * Checks if this Entity is a type of provided Object
     * 
     * @param type The object type to check
     */
    public isType<T extends Entity>(type: new (...params: any[]) => T): boolean {
        return (this instanceof type) === true;
    }

    /**
     * Performs a safe-cast from Entity to the provided type. Returns undefined if the entity
     * is not the provided type of object
     * 
     * @param type The object type to cast this entity into
     */
    public cast<T extends Entity>(type: new (...params: any[]) => T): T | null {
        return (this instanceof type) ? this as T : null;
    }

    /**
     * Performs a safe-cast from Entity to the provided type. Returns a Promise that is resolved
     * or rejected. Use Entity.cast() for the non-promise based version
     * 
     * @param type The object type to cast this entity into
     */
    public safeCast<T extends Entity>(type: new (...params: any[]) => T): Promise<T> {
        return new Promise((accept, reject) => {
            const object: T | null = this.cast(type);

            if (object) {
                return accept(object);
            }

            return reject(new Error("Entity.safeCast(type) - entity is not an instance of type"));
        });
    }

    /**
     * Returns the current parent of this object
     */
    public get parent(): Entity | null {
        const parentTransform: Transform | null = this._transform.parent;

        if (parentTransform) {
            return parentTransform.owner;
        }

        return null
    }

    /**
     * Returns the Stage that this object is attached to
     */
    public get stage(): Stage {
        return this._stage;
    }

    /**
     * Returns the Transform that allows moving, rotating or scaling this object
     */
    public get transform(): Transform {
        return this._transform;
    }

    /**
     * Called by the Rendering Engine to construct this object asynchronously. Object
     * will not be executed/rendered until the promise is resolved
     */
    protected create(): Promise<void> {
        return new Promise((accept, _) => {
            return accept();
        });
    }

    /**
     * Called by the Rendering Engine first time object is executed. This happens at the
     * start of a new frame for all new objects
     */
    protected start(): void { }

    /**
     * Called by the Rendering Engine just before a rendering is about to be done
     * 
     * @param deltaTime The time difference between the last and current frame in seconds
     */
    protected update(_deltaTime: number): void { }

    /**
     * Called by the Rendering Engine just after a rendering was done
     * 
     * @param deltaTime The time difference between the last and current frame in seconds
     */
    protected lateUpdate(_deltaTime: number): void { }

    /**
     * Called by the Rendering Engine when it was paused by a user or a script
     */
    protected onPause(): void { }

    /**
     * Called by the Rendering Engine when it was resumed from a previously paused state
     */
    protected onResume(): void { }

    /**
     * Called by the Rendering Engine when this object was removed from the Stage
     */
    protected onDestroy(): void { }

    /**
     * Called by the Rendering Engine when the Canvas/Renderer was resized to a new size
     * 
     * @param newWidth The new width of the Renderer/Canvas
     * @param newHeight The new height of the Renderer/Canvas
     */
    protected onResize(_newWidth: number, _newHeight: number): void { }
}