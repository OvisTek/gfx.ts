import { Entity } from "./entity";

/**
 * Base class for creating component systems executed by the Renderer
 */
export abstract class Component {
    private readonly _owner: Entity;

    private constructor(owner: Entity) {
        this._owner = owner;
    }

    public get owner(): Entity {
        return this._owner;
    }

    /**
     * Called when the component is created. Since components do not have
     * a public constructor, this can be used to initialise internal state
     */
    public abstract start();

    /**
     * Called by the Rendering Engine just before a rendering is about to be done
     * 
     * @param deltaTime The time difference between the last and current frame in seconds
     */
    public abstract update(deltaTime: number);

    /**
     * Called when the component is removed and should be destroyed/cleaned up
     */
    public abstract destroy();

    /**
     * Instantiate a new component with a component owner
     * 
     * @param type The type of Component to instantiate
     * @param owner The owner of the Component
     */
    public static create<T extends Component>(type: new (owner: Entity) => T, owner: Entity): T {
        return new type(owner);
    }
}