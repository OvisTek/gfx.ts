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

export class Keyboard extends InputDevice {
    private static readonly NUM_KEYS: number = 223;

    private _isPaused: boolean;
    private readonly _keys: Array<Event>;
    private readonly _states: Array<Event>;

    constructor() {
        super();
        this._keys = new Array<Event>(Keyboard.NUM_KEYS);
        this._states = new Array<Event>(Keyboard.NUM_KEYS);

        this._isPaused = true;

        this.resume();
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
            const key: Event = this._keys[i];
            const state: Event = this._states[i];

            if (key === Event.PRESS && state === Event.PRESS) {
                this._keys[i] = Event.HOLD;

                continue;
            }

            if ((key === Event.PRESS || key === Event.HOLD) && state === Event.RELEASE) {
                this._keys[i] = Event.RELEASE;

                continue;
            }

            if (key === Event.RELEASE && state === Event.RELEASE) {
                this._keys[i] = Event.NONE;

                continue;
            }

            if ((key === Event.NONE || key === Event.RELEASE) && state === Event.PRESS) {
                this._keys[i] = Event.PRESS;
            }
        }
    }

    /**
     * Returns the current state of the provided key
     * @param key - the key to check
     */
    public key(key: Key): Event {
        return this._keys[key];
    }

    private static _fillKeys(keyRef: Array<Event>, event: Event): void {
        const length: number = Keyboard.NUM_KEYS;

        for (let i: number = 0; i < length; i++) {
            keyRef[i] = event;
        }
    }

    private readonly _handlerDown = (event: KeyboardEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        let handled: boolean = false;

        if (event.keyCode !== undefined) {
            this._states[event.keyCode] = Event.PRESS;

            handled = true;
        }

        if (handled === true) {
            // Suppress "double action" if event handled
            event.preventDefault();
        }
    }

    private readonly _handlerUp = (event: KeyboardEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        let handled: boolean = false;

        if (event.keyCode !== undefined) {
            this._states[event.keyCode] = Event.RELEASE;

            handled = true;
        }

        if (handled === true) {
            // Suppress "double action" if event handled
            event.preventDefault();
        }
    }
}