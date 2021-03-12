export enum Event {
    NONE = 0,
    PRESS = 1,
    RELEASE = 2,
    HOLD = 3
}

/**
 * The current Button or Key state for a particular Query
 */
export abstract class InputState {
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

    public get isPressed(): boolean {
        return this._event === Event.PRESS;
    }

    public get isReleased(): boolean {
        return this._event === Event.RELEASE;
    }

    public get isHeld(): boolean {
        return this._event === Event.HOLD;
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

export abstract class InputDevice {
    constructor() { }

    public abstract setup(element: HTMLElement | undefined): void;
    public abstract pause(): void;
    public abstract resume(): void;

    /**
     * Updates the internal state of the keyboard
     */
    public abstract update(): void;
}