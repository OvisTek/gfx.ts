import { Event, InputDevice, InputState } from "../input-device";

/**
 * See key mappings in http://gcctech.org/csc/javascript/javascript_keycodes.htm
 */
export enum Key {
    ARROW_LEFT = 37,
    ARROW_UP = 38,
    ARROW_RIGHT = 39,
    ARROW_DOWN = 40,
    KEY_0 = 48,
    KEY_1 = 49,
    KEY_2 = 50,
    KEY_3 = 51,
    KEY_4 = 52,
    KEY_5 = 53,
    KEY_6 = 54,
    KEY_7 = 55,
    KEY_8 = 56,
    KEY_9 = 57,
    KEY_A = 65,
    KEY_B = 66,
    KEY_C = 67,
    KEY_D = 68,
    KEY_E = 69,
    KEY_F = 70,
    KEY_G = 71,
    KEY_H = 72,
    KEY_I = 73,
    KEY_J = 74,
    KEY_K = 75,
    KEY_L = 76,
    KEY_M = 77,
    KEY_N = 78,
    KEY_O = 79,
    KEY_P = 80,
    KEY_Q = 81,
    KEY_R = 82,
    KEY_S = 83,
    KEY_T = 84,
    KEY_U = 85,
    KEY_V = 86,
    KEY_W = 87,
    KEY_X = 88,
    KEY_Y = 89,
    KEY_Z = 90
}

export class Keyboard extends InputDevice {
    private static readonly DEFAULT_KEY: InputState = new InputState();

    private _isPaused: boolean;
    private readonly _keys: Map<Key, InputState>;
    private readonly _states: Map<Key, InputState>;
    private _holdFrameDelay: number;

    private _element: HTMLElement | undefined = undefined;

    constructor() {
        super();
        this._keys = new Map<Key, InputState>();
        this._states = new Map<Key, InputState>();

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
        const kd: InputState | undefined = this._keys.get(key);

        return kd ? (firstOnly ? kd.event === Event.PRESS && kd.frame === 0 : kd.event === Event.PRESS) : false;
    }

    /**
     * Checks if the provided keyboard key has been released. This normally follows
     * a pressed event.
     * 
     * @param key - the keyboard key to check
     */
    public isReleased(key: Key): boolean {
        const kd: InputState | undefined = this._keys.get(key);

        return kd ? kd.event === Event.RELEASE : false;
    }

    /**
     * Checks if the provided keyboard key has been pressed/held down without release.
     * 
     * @param key - the keyboard key to check
     */
    public isPressedDown(key: Key): boolean {
        const kd: InputState | undefined = this._keys.get(key);

        return kd ? kd.event === Event.HOLD : false;
    }

    /**
     * Returns the current state of the provided key
     * @param key - the key to check
     */
    public key(key: Key): InputState {
        const kd: InputState | undefined = this._keys.get(key);

        return kd ? kd : Keyboard.DEFAULT_KEY;
    }

    public setup(element: HTMLElement | undefined = undefined): void {
        // potentially de-register any previously registered events
        this.pause();

        // add the new element
        this._element = element;

        // re-register events
        this.resume();
    }

    public pause(): void {
        if (this._isPaused === false && this._element !== undefined) {
            // remove all existing listeners
            document.removeEventListener("keydown", this._handlerDown, false);
            document.removeEventListener("keyup", this._handlerUp, false);
        }

        this._isPaused = true;
    }

    public resume(): void {
        if (this._isPaused === true && this._element !== undefined) {
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
        const keys: Map<Key, InputState> = this._keys;
        const states: Map<Key, InputState> = this._states;

        // update all current key states every frame
        for (const [k, v] of keys.entries()) {
            if (v !== undefined && v !== null) {
                const stateData: InputState | undefined = states.get(k);

                if (stateData === undefined || stateData === null) {
                    continue;
                }

                const keyData: InputState = v;

                const state: Event = stateData.event;
                const key: Event = keyData.event;

                if (key === Event.PRESS && state === Event.PRESS) {
                    if (this._holdFrameDelay <= keyData.frame) {
                        keyData._set(Event.HOLD, keyData.ctrlKey, keyData.altKey, keyData.frame);
                    }

                    keyData._framepp();

                    continue;
                }

                if ((key === Event.PRESS || key === Event.HOLD) && state === Event.RELEASE) {
                    keyData._set(Event.RELEASE, stateData.altKey, stateData.ctrlKey, keyData.frame);
                    keyData._framepp();

                    continue;
                }

                if (key === Event.RELEASE && state === Event.RELEASE) {
                    keyData._reset();

                    continue;
                }

                if ((key === Event.NONE || key === Event.RELEASE) && state === Event.PRESS) {
                    keyData._set(Event.PRESS, stateData.altKey, stateData.ctrlKey, 0);
                }
            }
        }
    }

    private static _fillKeys(keyRef: Map<Key, InputState>, event: Event): void {
        for (const [, value] of keyRef.entries()) {
            if (value !== undefined && value !== null) {
                value._set(event, false, false, 0);
            }
        }
    }

    private readonly _handlerDown = (event: KeyboardEvent): void => {
        if (event.defaultPrevented) {
            return;
        }

        const keyCode: number = event.keyCode;

        if (keyCode !== undefined) {
            const key: InputState | undefined = this._states.get(keyCode);

            // ensure this key event is created and exists. Keys will be created on-demand
            if (key !== undefined && key !== null) {
                key._set(Event.PRESS, event.altKey, event.ctrlKey, 0);
            }
            else {
                const sKey: InputState = new InputState()._set(Event.PRESS, event.altKey, event.ctrlKey, 0);
                const nKey: InputState = new InputState();

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

        if (event.keyCode !== undefined) {
            const key: InputState | undefined = this._states.get(keyCode);

            // ensure this key event is created and exists. Keys will be created on-demand
            if (key !== undefined && key !== null) {
                key._set(Event.RELEASE, event.altKey, event.ctrlKey, 0);
            }
            else {
                const sKey: InputState = new InputState()._set(Event.RELEASE, event.altKey, event.ctrlKey, 0);
                const nKey: InputState = new InputState();

                this._states.set(keyCode, sKey);
                this._keys.set(keyCode, nKey);
            }

            event.preventDefault();
        }
    }
}