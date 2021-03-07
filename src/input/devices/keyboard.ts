import { Event, InputDevice } from "../input-device";

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

interface KeyData {
    event: Event;
    altKey: boolean;
    ctrlKey: boolean;
    frame: number;
}

export class Keyboard extends InputDevice {
    private static readonly NUM_KEYS: number = 223;
    private static readonly DEFAULT_KEY: KeyData = { event: Event.NONE, altKey: false, ctrlKey: false, frame: 0 };

    private _isPaused: boolean;
    private readonly _keys: Array<KeyData>;
    private readonly _states: Array<KeyData>;
    private _holdFrameDelay: number;

    constructor() {
        super();
        this._keys = new Array<KeyData>(Keyboard.NUM_KEYS);
        this._states = new Array<KeyData>(Keyboard.NUM_KEYS);

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
        const kd: KeyData = this._keys[key];

        return kd ? (firstOnly ? kd.event === Event.PRESS && kd.frame === 0 : kd.event === Event.PRESS) : false;
    }

    /**
     * Checks if the provided keyboard key has been released. This normally follows
     * a pressed event.
     * 
     * @param key - the keyboard key to check
     */
    public isReleased(key: Key): boolean {
        return this._keys[key] ? this._keys[key].event === Event.RELEASE : false;
    }

    /**
     * Checks if the provided keyboard key has been pressed/held down without release.
     * 
     * @param key - the keyboard key to check
     */
    public isPressedDown(key: Key): boolean {
        return this._keys[key] ? this._keys[key].event === Event.HOLD : false;
    }

    /**
     * Returns the current state of the provided key
     * @param key - the key to check
     */
    public key(key: Key): KeyData {
        return this._keys[key] ?? Keyboard.DEFAULT_KEY;
    }

    public pause(): void {
        if (this._isPaused === false) {
            // remove all existing listeners
            window.removeEventListener("keydown", this._handlerDown);
            window.removeEventListener("keyup", this._handlerUp);
        }

        this._isPaused = true;
    }

    public resume(): void {
        if (this._isPaused === true) {
            // reset all the key states
            Keyboard._fillKeys(this._keys, Event.NONE);
            Keyboard._fillKeys(this._states, Event.NONE);

            // add the listeners
            window.addEventListener("keydown", this._handlerDown);
            window.addEventListener("keyup", this._handlerUp);
        }

        this._isPaused = false;
    }

    public update(): void {
        const length: number = Keyboard.NUM_KEYS;

        for (let i: number = 0; i < length; i++) {
            const stateData: KeyData = this._states[i];

            if (stateData === undefined || stateData === null) {
                continue;
            }

            const keyData: KeyData = this._keys[i];

            const state: Event = stateData.event;
            const key: Event = keyData.event;

            if (key === Event.PRESS && state === Event.PRESS) {
                if (this._holdFrameDelay <= keyData.frame) {
                    keyData.event = Event.HOLD;
                }

                keyData.frame++;

                continue;
            }

            if ((key === Event.PRESS || key === Event.HOLD) && state === Event.RELEASE) {
                keyData.event = Event.RELEASE;
                keyData.altKey = stateData.altKey;
                keyData.ctrlKey = stateData.ctrlKey;
                keyData.frame++;

                continue;
            }

            if (key === Event.RELEASE && state === Event.RELEASE) {
                keyData.event = Event.NONE;
                keyData.altKey = false;
                keyData.ctrlKey = false;
                keyData.frame = 0;

                continue;
            }

            if ((key === Event.NONE || key === Event.RELEASE) && state === Event.PRESS) {
                keyData.event = Event.PRESS;
                keyData.altKey = stateData.altKey;
                keyData.ctrlKey = stateData.ctrlKey;
                keyData.frame = 0;
            }
        }
    }

    private static _fillKeys(keyRef: Array<KeyData>, event: Event): void {
        const length: number = Keyboard.NUM_KEYS;

        for (let i: number = 0; i < length; i++) {
            const key: KeyData = keyRef[i];

            if (key === undefined || key === null) {
                continue;
            }

            key.event = event;
            key.altKey = false;
            key.ctrlKey = false;
            key.frame = 0;
        }
    }

    private readonly _handlerDown = (event: KeyboardEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        const keyCode: number = event.keyCode;

        if (keyCode !== undefined) {
            const key: KeyData = this._states[keyCode];

            // ensure this key event is created and exists. Keys will be created on-demand
            if (key !== undefined && key !== null) {
                key.event = Event.PRESS;
                key.altKey = event.altKey;
                key.ctrlKey = event.ctrlKey;
            }
            else {
                const sKey: KeyData = { event: Event.PRESS, altKey: event.altKey, ctrlKey: event.ctrlKey, frame: 0 };
                const nKey: KeyData = { event: Event.NONE, altKey: false, ctrlKey: false, frame: 0 };

                this._states[keyCode] = sKey;
                this._keys[keyCode] = nKey;
            }

            event.preventDefault();
        }
    }

    private readonly _handlerUp = (event: KeyboardEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        const keyCode: number = event.keyCode;

        if (event.keyCode !== undefined) {
            const key: KeyData = this._states[keyCode];

            // ensure this key event is created and exists. Keys will be created on-demand
            if (key !== undefined && key !== null) {
                key.event = Event.RELEASE;
                key.altKey = event.altKey;
                key.ctrlKey = event.ctrlKey;
            }
            else {
                const sKey: KeyData = { event: Event.RELEASE, altKey: event.altKey, ctrlKey: event.ctrlKey, frame: 0 };
                const nKey: KeyData = { event: Event.NONE, altKey: false, ctrlKey: false, frame: 0 };

                this._states[keyCode] = sKey;
                this._keys[keyCode] = nKey;
            }

            event.preventDefault();
        }
    }
}