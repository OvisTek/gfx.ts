import { Entity } from "./entity";
import { Identifiable } from "../identifiable";

/**
 * Base class for creating component systems executed by the Renderer
 */
export abstract class Component extends Identifiable {
    private _owner?: Entity;

    constructor() {
        super();
        this._owner = undefined;
    }

    /**
     * Get the read-only owner of this component
     */
    public get owner(): Entity {
        if (this._owner == undefined) {
            throw new Error("Component.owner - invalid access, component was not setup properly");
        }

        return this._owner;
    }

    /**
     * Removes this component from the owner and optionally destroys it
     * 
     * @param shouldDestroy - Should this Component be destroyed/removed from memory (default true)
     */
    public remove(shouldDestroy: boolean = true): void {
        if (this._owner != undefined) {
            this._owner.removeComponent(this, shouldDestroy);
        }

        this._owner = undefined;
    }

    /**
     * Called when the component is created. Since components do not have
     * a public constructor, this can be used to initialise internal state
     */
    public abstract create(): void;

    /**
     * Called by the Rendering Engine just before a rendering is about to be done
     * 
     * @param deltaTime The time difference between the last and current frame in seconds
     */
    public abstract update(deltaTime: number): void;

    /**
     * Called when the component is removed and should be destroyed/cleaned up
     */
    public abstract destroy(): void;

    /**
     * Instantiate a new component with a component owner
     * 
     * @param type The type of Component to instantiate
     * @param owner The owner of the Component
     */
    public static create<T extends Component>(instance: T, owner: Entity): T {
        // remove from previous parent if any
        instance.remove(false);

        // add the new owner as the provided object
        instance._owner = owner;

        return instance;
    }

    /**
     * Checks if this Component is a type of provided Object
     * 
     * @param type The object type to check
     */
    public isType<T extends Component>(type: new (...args: [any]) => T): boolean {
        return (this instanceof type) == true;
    }

    /**
     * Performs a safe-cast from Component to the provided type. Returns undefined if the component
     * is not the provided type of object
     * 
     * @param type The object type to cast this component into
     */
    public cast<T extends Component>(type: new (...args: [any]) => T): T | undefined {
        return (this instanceof type) ? <T>this : undefined;
    }

    /**
     * Performs a safe-cast from Component to the provided type. Returns a Promise that is resolved
     * or rejected. Use Component.cast() for the non-promise based version
     * 
     * @param type The object type to cast this component into
     */
    public safeCast<T extends Component>(type: new (...args: [any]) => T): Promise<T> {
        return new Promise((accept, reject) => {
            const object: T | undefined = this.cast(type);

            if (object) {
                return accept(object);
            }

            return reject(new Error("Component.safeCast(type) - component is not an instance of type"));
        });
    }
}