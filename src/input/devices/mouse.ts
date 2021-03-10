import { InputDevice } from "../input-device";

export enum Button {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2
}

export class Mouse extends InputDevice {

    private _element: HTMLElement | undefined = undefined;
    private _isPointerLocked: boolean;

    constructor() {
        super();

        this._isPointerLocked = false;
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

    }

    public resume(): void {

    }

    public update(): void {

    }

    public lockPointer(): Promise<void> {
        return new Promise<void>((accept, reject) => {
            this._element.requestPointerLock();
        });
    }

    public unlockPointer(): Promise<void> {
        return new Promise<void>((accept, reject) => {
            document.exitPointerLock();
        });
    }

    public get pointerLocked(): boolean {
        return false;
    }
}