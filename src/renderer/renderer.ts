import { Stage } from "./stage/stage";

/**
 * Renderer is a singleton type that can be accessed from anywhere in the application.
 * Only a single instance of this class exists. Use Renderer.instance to access.
 * 
 * Renderer manages the global event loop and all required callbacks. 
 */
export class Renderer {
    private static _instance: Renderer;

    // NOTE: This might have to change away from read-only to allow
    // users to create multiple stages or levels to be loaded/unloaded
    private readonly _stage: Stage;

    private constructor() {
        this._stage = new Stage();
    }

    public get stage(): Stage {
        return this._stage;
    }

    /**
     * Access the one and only Renderer instance
     */
    public static get instance(): Renderer {
        if (!Renderer._instance) {
            Renderer._instance = new Renderer();
        }

        return Renderer._instance;
    }
}