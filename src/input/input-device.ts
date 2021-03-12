export enum Event {
    NONE = 0,
    PRESS = 1,
    RELEASE = 2,
    HOLD = 3
}

export enum States {
    ALT = 0,
    CTRL = 1,
    META = 2,
    SHIFT = 3
}

/**
 * The current Button or Key state for a particular Query
 */
export abstract class InputState {
    private _event: Event;
    private _states: number;
    private _frame: number;

    constructor() {
        this._event = Event.NONE;
        this._states = 0 | 0;
        this._frame = 0;
    }

    public get event(): Event {
        return this._event;
    }

    public get states(): number {
        return this._states;
    }

    public get altKey(): boolean {
        return !!((this._states >> States.ALT) & 1);
    }

    public get ctrlKey(): boolean {
        return !!((this._states >> States.CTRL) & 1);
    }

    public get metaKey(): boolean {
        return !!((this._states >> States.META) & 1);
    }

    public get shiftKey(): boolean {
        return !!((this._states >> States.SHIFT) & 1);
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

    public _set(event: Event, states: number, frame: number): InputState {
        this._event = event;
        this._states = states;
        this._frame = frame;

        return this;
    }

    public _reset(): InputState {
        return this._set(Event.NONE, 0, 0);
    }

    public _framepp(): InputState {
        this._frame++;

        return this;
    }

    public static compileStates(altKey: boolean, ctrlKey: boolean, metaKey: boolean, shiftKey: boolean): number {
        let states: number = 0;

        states = altKey ? states | (1 << States.ALT) : states & ~(1 << States.ALT);
        states = ctrlKey ? states | (1 << States.CTRL) : states & ~(1 << States.CTRL);
        states = metaKey ? states | (1 << States.META) : states & ~(1 << States.META);
        states = shiftKey ? states | (1 << States.SHIFT) : states & ~(1 << States.SHIFT);

        return states;
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