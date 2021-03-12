import { InputDevice, Event } from "./input-device";
import { Keyboard } from "./devices/keyboard";
import { Mouse } from "./devices/mouse";

/**
 * The current Button or Key state for a particular Query
 */
export class InputState {
    private _event: Event;
    private _altKey: boolean;
    private _ctrlKey: boolean;
    private _frame: number;

    constructor() {
        this._event = Event.NONE;
        this._altKey = false;
        this._ctrlKey = false;
        this._frame = 0;
    }

    public get event(): Event {
        return this._event;
    }

    public get altKey(): boolean {
        return this._altKey;
    }

    public get ctrlKey(): boolean {
        return this._ctrlKey;
    }

    public get frame(): number {
        return this._frame;
    }

    public _set(event: Event, altKey: boolean, ctrlKey: boolean, frame: number): InputState {
        this._event = event;
        this._altKey = altKey;
        this._ctrlKey = ctrlKey;
        this._frame = frame;

        return this;
    }

    public _reset(): InputState {
        return this._set(Event.NONE, false, false, 0);
    }

    public _framepp(): InputState {
        this._frame++;

        return this;
    }
}

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

    public static get keyboard(): Keyboard {
        return this.instance.keyboard;
    }

    public static get mouse(): Mouse {
        return this.instance.mouse;
    }

    public setup(element: HTMLElement | undefined): void {
        this._keyboard.setup(element);
        this._mouse.setup(element);
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