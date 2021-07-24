import { Event, InputDevice, InputState } from "../input-device";

/**
 * See key mappings in http://gcctech.org/csc/javascript/javascript_keycodes.htm
 */
export enum Key {
    ARROW_LEFT = 37,
    ARROW_UP = 38,
    ARROW_RIGHT = 39,
    ARROW_DOWN = 40,
    N0 = 48,
    N1 = 49,
    N2 = 50,
    N3 = 51,
    N4 = 52,
    N5 = 53,
    N6 = 54,
    N7 = 55,
    N8 = 56,
    N9 = 57,
    A = 65,
    B = 66,
    C = 67,
    D = 68,
    E = 69,
    F = 70,
    G = 71,
    H = 72,
    I = 73,
    J = 74,
    K = 75,
    L = 76,
    M = 77,
    N = 78,
    O = 79,
    P = 80,
    Q = 81,
    R = 82,
    S = 83,
    T = 84,
    U = 85,
    V = 86,
    W = 87,
    X = 88,
    Y = 89,
    Z = 90
}

export class KeyState extends InputState {
    constructor() {
        super();
    }
}

export class Keyboard extends InputDevice {
    private static readonly DEFAULT_KEY: KeyState = new KeyState();

    private _isPaused: boolean;
    private readonly _keys: Map<Key, KeyState>;
    private readonly _states: Map<Key, KeyState>;
    private _holdFrameDelay: number;

    private _element: HTMLElement | null = null;

    constructor() {
        super();
        this._keys = new Map<Key, KeyState>();
        this._states = new Map<Key, KeyState>();

        this._isPaused = true;
        this._holdFrameDelay = 5;

        this.resume();
    }

    /**
     * Get or Set the frame-delay of when the PRESSED event is changed into the HELD event.
     * Default is 5 frame delay
     */
    public get holdFrameDelay(): number {
        return this._holdFrameDelay;
    }

    public set holdFrameDelay(delay: number) {
        this._holdFrameDelay = delay > 0 ? delay : 0;
    }

    /**
     * Checks if the provided keyboard key has been pressed/clicked
     * 
     * @param key - the keyboard key to check
     */
    public isPressed(key: Key, firstOnly: boolean = true): boolean {
        const kd: KeyState | undefined = this._keys.get(key);

        return kd ? (firstOnly ? kd.event === Event.PRESS && kd.frame === 0 : kd.event === Event.PRESS) : false;
    }

    /**
     * Checks if the provided keyboard key has been released. This normally follows
     * a pressed event.
     * 
     * @param key - the keyboard key to check
     */
    public isReleased(key: Key): boolean {
        const kd: KeyState | undefined = this._keys.get(key);

        return kd ? kd.event === Event.RELEASE : false;
    }

    /**
     * Checks if the provided keyboard key has been pressed/held down without release.
     * 
     * @param key - the keyboard key to check
     */
    public isPressedDown(key: Key): boolean {
        const kd: KeyState | undefined = this._keys.get(key);

        return kd ? kd.event === Event.HOLD : false;
    }

    /**
     * Returns the current state of the provided key
     * @param key - the key to check
     */
    public key(key: Key): KeyState {
        const kd: KeyState | undefined = this._keys.get(key);

        return kd ? kd : Keyboard.DEFAULT_KEY;
    }

    public setup(element: HTMLElement | null = null): void {
        // potentially de-register any previously registered events
        this.pause();

        // add the new element
        this._element = element;

        // re-register events
        this.resume();
    }

    public pause(): void {
        if (this._isPaused === false && this._element !== null) {
            // remove all existing listeners
            document.removeEventListener("keydown", this._handlerDown, false);
            document.removeEventListener("keyup", this._handlerUp, false);
        }

        this._isPaused = true;
    }

    public resume(): void {
        if (this._isPaused === true && this._element !== null) {
            // reset all the key states
            Keyboard._fillKeys(this._keys, Event.NONE);
            Keyboard._fillKeys(this._states, Event.NONE);

            // add the listeners
            document.addEventListener("keydown", this._handlerDown, false);
            document.addEventListener("keyup", this._handlerUp, false);
        }

        this._isPaused = false;
    }

    public update(): void {
        const keys: Map<Key, KeyState> = this._keys;
        const states: Map<Key, KeyState> = this._states;

        // update all current key states every frame
        for (const [k, v] of keys.entries()) {
            if (v !== null && v !== null) {
                const stateData: KeyState | undefined = states.get(k);

                if (!stateData) {
                    continue;
                }

                const keyData: KeyState = v;

                const state: Event = stateData.event;
                const key: Event = keyData.event;

                if (key === Event.PRESS && state === Event.PRESS) {
                    if (this._holdFrameDelay <= keyData.frame) {
                        keyData._set(Event.HOLD, keyData.states, keyData.frame);
                    }

                    keyData._framepp();

                    continue;
                }

                if ((key === Event.PRESS || key === Event.HOLD) && state === Event.RELEASE) {
                    keyData._set(Event.RELEASE, stateData.states, keyData.frame);
                    keyData._framepp();

                    continue;
                }

                if (key === Event.RELEASE && state === Event.RELEASE) {
                    keyData._reset();

                    continue;
                }

                if ((key === Event.NONE || key === Event.RELEASE) && state === Event.PRESS) {
                    keyData._set(Event.PRESS, stateData.states, 0);
                }
            }
        }
    }

    private static _fillKeys(keyRef: Map<Key, KeyState>, event: Event): void {
        for (const [, value] of keyRef.entries()) {
            if (value !== null && value !== null) {
                value._set(event, 0, 0);
            }
        }
    }

    private readonly _handlerDown = (event: KeyboardEvent): void => {
        if (event.defaultPrevented) {
            return;
        }

        const keyCode: number = event.keyCode;

        if (keyCode !== null) {
            const key: KeyState | undefined = this._states.get(keyCode);
            const states: number = InputState.compileStates(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);

            // ensure this key event is created and exists. Keys will be created on-demand
            if (key) {
                key._set(Event.PRESS, states, 0);
            }
            else {
                const sKey: KeyState = new KeyState()._set(Event.PRESS, states, 0);
                const nKey: KeyState = new KeyState();

                this._states.set(keyCode, sKey);
                this._keys.set(keyCode, nKey);
            }

            event.preventDefault();
        }
    }

    private readonly _handlerUp = (event: KeyboardEvent): void => {
        if (event.defaultPrevented) {
            return;
        }

        const keyCode: number = event.keyCode;

        if (event.keyCode !== null) {
            const key: KeyState | undefined = this._states.get(keyCode);
            const states: number = InputState.compileStates(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);

            // ensure this key event is created and exists. Keys will be created on-demand
            if (key) {
                key._set(Event.RELEASE, states, 0);
            }
            else {
                const sKey: KeyState = new KeyState()._set(Event.RELEASE, states, 0);
                const nKey: KeyState = new KeyState();

                this._states.set(keyCode, sKey);
                this._keys.set(keyCode, nKey);
            }

            event.preventDefault();
        }
    }
}