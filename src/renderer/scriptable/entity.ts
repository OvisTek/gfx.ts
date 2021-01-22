import { Stage } from "../stage/stage";
import { Transform } from "../transform";
import { Renderer } from "../renderer";
import { Component } from "./component";
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
    private static readonly _optDefault: EntityOptions = { visibility: true, autoCreate: true };

    // this is where the stage object will be rendered in the scene
    private readonly _transform: Transform;

    // all the child objects of this entity
    private readonly _children: Array<Entity>;
    private readonly _components: Array<Component>;
    private readonly _componentsQueue: Array<Component>;

    private _stage?: Stage;
    private _visibility: boolean;
    private _isCreated: boolean;

    // the parent of this object (if any)
    // if undefined, then this object is not part of the scene-graph
    private _parent?: Entity;

    constructor(opt: EntityOptions | undefined = undefined) {
        super();
        const options: EntityOptions = opt || Entity._optDefault;

        this._stage = undefined;
        this._parent = undefined;

        this._transform = new Transform();
        this._children = new Array<Entity>();
        this._components = new Array<Component>();
        this._componentsQueue = new Array<Component>();

        this._isCreated = false;
        this._visibility = options.visibility;

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
    public cast<T extends Entity>(type: new (...params: any[]) => T): T | undefined {
        return (this instanceof type) ? this as T : undefined;
    }

    /**
     * Performs a safe-cast from Entity to the provided type. Returns a Promise that is resolved
     * or rejected. Use Entity.cast() for the non-promise based version
     * 
     * @param type The object type to cast this entity into
     */
    public safeCast<T extends Entity>(type: new (...params: any[]) => T): Promise<T> {
        return new Promise((accept, reject) => {
            const object: T | undefined = this.cast(type);

            if (object !== undefined) {
                return accept(object);
            }

            return reject(new Error("Entity.safeCast(type) - entity is not an instance of type"));
        });
    }

    /**
     * Returns the current parent of this object
     */
    public get parent(): Entity | undefined {
        // do not return the stage root
        if (this._parent != undefined && this._parent.isRoot) {
            return undefined;
        }

        return this._parent;
    }

    public get isRoot(): boolean {
        return false;
    }

    /**
     * Returns all the children of this object
     */
    public get children(): Array<Entity> {
        return this._children;
    }

    /**
     * Returns all the components of this object
     */
    public get components(): Array<Component> {
        return this._components;
    }

    /**
     * Adds a new Component of provided type and returns a new instance
     * 
     * @param type The type of Component to instantiate
     */
    public addComponent<T extends Component>(instance: T): T {
        const newComponent: T = Component.create(instance, this);

        // queue the new component for execution in the next frame
        // or at the start of this object
        this._componentsQueue.push(newComponent);

        return newComponent;
    }

    /**
     * Removes an eisting component instance. This will also dispose the component
     * 
     * @param existing - The existing component to remove from this entity
     * @param shouldDestroy - Default (true) should the component be destroyed and freed from memory
     */
    public removeComponent(existing: Component, shouldDestroy: boolean = true): boolean {
        const components: Array<Component> = this._components;

        // NOTE - This can be vastly improved to remove 
        // the O(n) to O(1) via trickery
        const index: number = components.indexOf(existing);

        if (index >= 0) {
            const removed: Array<Component> = components.splice(index, 1);

            // destroy/cleanup all removed elements
            if (shouldDestroy == true) {
                const len: number = removed.length;

                for (let i = 0; i < len; i++) {
                    removed[i].destroy();
                }
            }

            return true;
        }

        return false;
    }

    /**
     * Searches the components of this object that matches a particular type and returns the first
     * encountered
     * 
     * This is an O(n) search so the results should ideally be cached locally
     * 
     * @param type - The type of object to search
     */
    public getComponentOfType<T extends Component>(type: new (owner: Entity) => T): T | undefined {
        const components: Array<Component> = this._components;
        const len: number = components.length;

        if (len > 0) {
            for (let i = 0; i < len; i++) {
                const comp: Component = components[i];

                if (comp && comp.isType(type)) {
                    return <T>comp;
                }
            }
        }

        return undefined;
    }

    /**
     * Searches the components of this object that matches a particular type
     * 
     * This is an O(n) search so the results should ideally be cached locally
     * 
     * @param type - The type of object to search
     */
    public getComponentsOfType<T extends Component>(type: new (owner: Entity) => T, optresult: Array<T> | undefined = undefined): Array<T> {
        const result: Array<T> = optresult || new Array<T>();
        const components: Array<Component> = this._components;
        const len: number = components.length;

        if (len > 0) {
            for (let i = 0; i < len; i++) {
                const comp: Component = components[i];

                if (comp && comp.isType(type)) {
                    result.push(<T>comp);
                }
            }
        }

        return result;
    }

    /**
     * Searches the children of this object that matches a particular type and returns the first
     * encountered
     * 
     * This is an O(n) search so the results should ideally be cached locally
     * 
     * @param type - The type of object to search
     */
    public getChildOfType<T extends Entity>(type: new (...params: [any]) => T): T | undefined {
        const children: Array<Entity> = this._children;
        const len: number = children.length;

        if (len > 0) {
            for (let i = 0; i < len; i++) {
                const child: Entity = children[i];

                if (child && child.isType(type)) {
                    return <T>child;
                }
            }
        }

        return undefined;
    }

    /**
     * Searches the children of this object that matches a particular type
     * 
     * This is an O(n) search so the results should ideally be cached locally
     * 
     * @param type The type of object to search
     * @param optresult (optional) array to append the results into
     */
    public getChildrenOfType<T extends Entity>(type: new (...params: any[]) => T, optresult: Array<T> | undefined = undefined): Array<T> {
        const result: Array<T> = optresult || new Array<T>();
        const children: Array<Entity> = this._children;
        const len: number = children.length;

        if (len > 0) {
            for (let i = 0; i < len; i++) {
                const child: Entity = children[i];

                if (child && child.isType(type)) {
                    result.push(<T>child);
                }
            }
        }

        return result;
    }

    /**
     * Searches the children of this object that matches a particular type. Also searches the children of
     * children recursively
     * 
     * This is an O(n) search so the results should ideally be cached locally
     * 
     * @param type The type of object to search
     * @param optresult (optional) array to append the results into
     */
    public findChildrenOfType<T extends Entity>(type: new (...params: any[]) => T, optresult: Array<T> | undefined = undefined): Array<T> {
        const result: Array<T> = optresult || new Array<T>();
        const children: Array<Entity> = this._children;
        const len: number = children.length;

        if (len > 0) {
            for (let i = 0; i < len; i++) {
                const child: Entity = children[i];

                if (child) {
                    if (child.isType(type)) {
                        result.push(<T>child);
                    }

                    // recurse deeper on the child
                    child.findChildrenOfType(type, result);
                }
            }
        }

        return result;
    }

    /**
     * Searches the children of this object that matches a particular type and returns the first
     * encountered. Also searches the children of children recursively.
     * 
     * This is an O(n) search so the results should ideally be cached locally
     * 
     * @param type - The type of object to search
     */
    public findChildOfType<T extends Entity>(type: new (...params: [any]) => T): T | undefined {
        const children: Array<Entity> = this._children;
        const len: number = children.length;

        if (len > 0) {
            // first pass, the children of this Entity
            for (let i = 0; i < len; i++) {
                const child: Entity = children[i];

                if (child && child.isType(type)) {
                    return <T>child;
                }
            }

            // second pass, start going to the children of children
            for (let i = 0; i < len; i++) {
                const child: Entity = children[i];

                if (child) {
                    const subChild: T | undefined = child.findChildOfType(type);

                    // return first valid encounter (if any)
                    if (subChild != undefined) {
                        return subChild;
                    }
                }
            }
        }

        return undefined;
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
     * Query if this object was successfully created, AKA the create() function
     * executed properly.
     */
    public get created(): boolean {
        return this._isCreated;
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
     * Sets a new parent for this Entity. Additionally, provides an option to preserve
     * the current world coordinates of this object in the transform.
     * 
     * @param newParent - the new parent to set
     * @param preserveWorld - (default true) optionally preserves the current world coordinates
     */
    public setParent(newParent: Entity | undefined, preserveWorld: boolean = true) {
        if (preserveWorld === true) {
            this.transform.worldToLocal();
        }

        this.parent = newParent;
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
     * Returns the Stage that this object is attached to
     */
    public get stage(): Stage {
        if (!this._stage) {
            throw new Error("Entity.stage() - object was not setup correctly, context unavailable");
        }

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
        return new Promise((accept, reject) => {
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
    protected update(deltaTime: number): void { }

    /**
     * Called by the Rendering Engine just after a rendering was done
     * 
     * @param deltaTime The time difference between the last and current frame in seconds
     */
    protected lateUpdate(deltaTime: number): void { }

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
    protected onResize(newWidth: number, newHeight: number): void { }

    /**
     * Safe execution of the create() function. This should not be called from user-space
     * 
     * @param stage The Stage reference
     */
    public _exec_Create(stage: Stage): Promise<void> {
        if (this._stage != undefined) {
            throw new Error("Entity._exec_Create(Stage) - entity already part of a stage, destroy it first before re-creating");
        }

        // sets the stage reference
        this._stage = stage;

        // a newly constructed object must always have a parent
        if (!this._parent) {
            this.parent = stage.root;
        }

        return this.create();
    }

    /**
     * Safe execution of the create() function. This should not be called from user-space
     * 
     * @param stage The Stage reference
     */
    public _exec_Start(): Error | undefined {
        // sets the tag that this object has been created properly
        this._isCreated = true;

        try {
            this._clearComponentQueue();

            this.start();
        }
        catch (error) {
            return error;
        }

        return undefined;
    }

    /**
     * Safe execution of the update() function. This should not be called from user-space
     * 
     * @param deltaTime The time difference between the last and current frame in seconds
     */
    public _exec_Update(deltaTime: number): Error | undefined {
        try {
            this._clearComponentQueue();

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

            this._stage = undefined;
        }
        catch (error) {
            this._stage = undefined;

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
    public _exec_OnResize(newWidth: number, newHeight: number): Error | undefined {
        try {
            this.onResize(newWidth, newHeight);
        }
        catch (error) {
            return error;
        }

        return undefined;
    }

    /**
     * Clears any created component queues.
     * NOTE: This is executed by the Engine
     */
    private _clearComponentQueue(): void {
        if (this._componentsQueue.length > 0) {
            let newObject: Component | undefined = this._componentsQueue.pop();

            // loop until the queue is completely empty
            while (newObject) {
                newObject.create();

                // add to components list
                this._components.push(newObject);

                newObject = this._componentsQueue.pop();
            }
        }
    }
}