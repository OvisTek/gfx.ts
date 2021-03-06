import { InputDevice } from "./input-device";
import { Keyboard } from "./devices/keyboard";
import { Mouse } from "./devices/mouse";

/**
 * Input allows querying and accessing keyboard and mouse events from a global context. Input
 * is a singleton managed by the gfx runtime.
 */
export class Input extends InputDevice {
    private static readonly _instance: Input = new Input();

    private readonly _keyboard: Keyboard;
    private readonly _mouse: Mouse;

    private constructor() {
        super();
        this._keyboard = new Keyboard();
        this._mouse = new Mouse();
    }

    public get keyboard(): Keyboard {
        return this._keyboard;
    }

    public get mouse(): Mouse {
        return this._mouse;
    }

    public static get instance(): Input {
        return this._instance;
    }

    public pause(): void {
        this._keyboard.pause();
        this._mouse.pause();
    }

    public resume(): void {
        this._keyboard.resume();
        this._mouse.resume();
    }

    public update(): void {
        this._keyboard.update();
        this._mouse.update();
    }
}