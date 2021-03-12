import { SavedPromiseArray } from "../../util/saved-promise-array";
import { InputDevice } from "../input-device";

export enum Button {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2
}

export class Mouse extends InputDevice {

    private _element: HTMLElement | undefined = undefined;
    private _isPaused: boolean;

    private _posX: number;
    private _posY: number;

    private _movX: number;
    private _movY: number;

    // saved promises
    private readonly _lockPointerPromises: SavedPromiseArray<void>;
    private readonly _unlockPointerPromises: SavedPromiseArray<void>;

    constructor() {
        super();

        this._lockPointerPromises = new SavedPromiseArray<void>();
        this._unlockPointerPromises = new SavedPromiseArray<void>();

        this._posX = 0.0;
        this._posY = 0.0

        this._movX = 0.0;
        this._movY = 0.0;

        this._isPaused = true;

        this.resume();
    }

    public get positionX(): number {
        return this._posX + this._movX;
    }

    public get positionY(): number {
        return this._posY + this._movY;
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
            document.removeEventListener('pointerlockerror', this._pointerLockError, false);
            document.removeEventListener('pointerlockchange', this._pointerLockChange, false);

            this._element.removeEventListener("mousemove", this._updatePosition, false);
        }

        this._isPaused = true;
    }

    public resume(): void {
        if (this._isPaused === true && this._element !== undefined) {
            // add the listeners
            document.addEventListener('pointerlockerror', this._pointerLockError, false);
            document.addEventListener('pointerlockchange', this._pointerLockChange, false);

            this._element.addEventListener("mousemove", this._updatePosition, false);
        }

        this._isPaused = false;
    }

    public update(): void {

    }

    /**
     * Requests for the mouse pointer to be locked and become invisible. This is an Async process.
     * 
     * @returns - Promise to be resolved
     */
    public lockPointer(): Promise<void> {
        return new Promise<void>((accept, reject) => {
            if (this._element === undefined) {
                return reject(new Error("Mouse.lockPointer() - cannot lock pointer as target element is undefined"));
            }

            if (this.pointerLocked === true) {
                return reject(new Error("Mouse.lockPointer() - cannot lock as pointer is already locked"));
            }

            // only request once, otherwise add the promise to be resolved along with the rest
            if (this._lockPointerPromises.length <= 0) {
                this._element.requestPointerLock();
            }

            this._lockPointerPromises.add(accept, reject);
        });
    }

    /**
     * Requests for the mouse pointer to be unlocked and become visible. This is an Async process.
     * 
     * @returns - Promise to be resolved
     */
    public unlockPointer(): Promise<void> {
        return new Promise<void>((accept, reject) => {
            if (this.pointerLocked === false) {
                return reject(new Error("Mouse.unlockPointer() - cannot unlock as pointer is not locked"));
            }

            // only request once, otherwise add the promise to be resolved along with the rest
            if (this._unlockPointerPromises.length <= 0) {
                document.exitPointerLock();
            }

            this._unlockPointerPromises.add(accept, reject);
        });
    }

    /**
     * Check if the current Mouse pointer is in a locked or unlocked state
     */
    public get pointerLocked(): boolean {
        const state: Element | null = document.pointerLockElement;

        return state !== undefined && state !== null;
    }

    private readonly _pointerLockChange = (_event: Event): void => {
        const state: Element | null = document.pointerLockElement;

        if (state !== undefined && state !== null && state === this._element) {
            this._lockPointerPromises.accept();
        }
        else {
            this._unlockPointerPromises.accept();
        }
    }

    private readonly _pointerLockError = (_event: Event): void => {
        this._lockPointerPromises.reject(new Error("Mouse.lockPointer() - unable to lock pointer due to browser error"));
    }

    private readonly _updatePosition = (event: MouseEvent): void => {
        this._posX = event.clientX;
        this._posY = event.clientY;

        if (this.pointerLocked) {
            this._movX += event.movementX;
            this._movY += event.movementY;
        }
        else {
            this._movX = 0.0;
            this._movY = 0.0;
        }
    }
}