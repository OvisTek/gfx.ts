export enum Event {
    NONE = 0,
    PRESS = 1,
    RELEASE = 2,
    HOLD = 3
}

export abstract class InputDevice {
    constructor() { }

    public abstract pause(): void;
    public abstract resume(): void;

    /**
     * Updates the internal state of the keyboard
     */
    public abstract update(): void;
}