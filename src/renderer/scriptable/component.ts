import { Entity } from "./entity";

/**
 * Base class for creating component systems executed by the Renderer
 */
export abstract class Component {
    private readonly _owner: Entity;

    protected constructor(owner: Entity) {
        this._owner = owner;
    }

    /**
     * Get the read-only owner of this component
     */
    public get owner(): Entity {
        return this._owner;
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
    public static create<T extends Component>(type: new (owner: Entity) => T, owner: Entity): T {
        return new type(owner);
    }

    /**
     * Performs a safe-cast from Component to the provided type. Returns undefined if the component
     * is not the provided type of object
     * 
     * @param type The object type to cast this component into
     */
    public cast<T extends Component>(type: new (owner: Entity) => T): T | undefined {
        if (this instanceof type) {
            return <T>this;
        }

        return undefined;
    }

    /**
     * Performs a safe-cast from Component to the provided type. Returns a Promise that is resolved
     * or rejected. Use Component.cast() for the non-promise based version
     * 
     * @param type The object type to cast this component into
     */
    public safeCast<T extends Component>(type: new (owner: Entity) => T): Promise<T> {
        return new Promise((accept, reject) => {
            const object: T | undefined = this.cast(type);

            if (object) {
                return accept(object);
            }

            return reject(new Error("Component.safeCast(type) - component is not an instance of type"));
        });
    }
}