import { Camera } from "./camera";
import { PerspectiveCamera as ThreePerspectiveCamera } from "three";

/**
 * Perspective Camera for 3D Scenes
 */
export class PerspectiveCamera extends Camera {
    private _fov: number;
    private _width: number;
    private _height: number;
    private _near: number;
    private _far: number;
    private _requiresUpdate: boolean;

    private readonly _threeCamera: ThreePerspectiveCamera;

    constructor(fov: number = 50, width: number = 1024, height: number = 1024, near: number = 0.1, far: number = 5000.0) {
        super();

        this._fov = fov;
        this._width = width;
        this._height = height;
        this._near = near;
        this._far = far;
        this._requiresUpdate = false;

        this._threeCamera = new ThreePerspectiveCamera(this.fov, this.aspect, this.near, this.far);
    }

    public get threeCamera(): ThreePerspectiveCamera {
        return this._threeCamera;
    }

    public get fov(): number {
        return this._fov;
    }

    public set fov(value: number) {
        if (this._fov !== value) {
            this._fov = value;
            this._requiresUpdate = true;
        }
    }

    public get width(): number {
        return this._width;
    }

    public set width(value: number) {
        if (this._width !== value) {
            this._width = value;
            this._requiresUpdate = true;
        }
    }

    public get height(): number {
        return this._height;
    }

    public set height(value: number) {
        if (this._height !== value) {
            this._height = value;
            this._requiresUpdate = true;
        }
    }

    public get near(): number {
        return this._near;
    }

    public set near(value: number) {
        if (this._near !== value) {
            this._near = value;
            this._requiresUpdate = true;
        }
    }

    public get far(): number {
        return this._far;
    }

    public set far(value: number) {
        if (this._far !== value) {
            this._far = value;
            this._requiresUpdate = true;
        }
    }

    public get aspect(): number {
        return this._width / this._height;
    }

    public get isPerspective(): boolean {
        return true;
    }

    public get isOrthographic(): boolean {
        return false;
    }

    protected update(_dt: number): void {
        if (this._requiresUpdate) {
            const camera: ThreePerspectiveCamera = this._threeCamera;

            camera.fov = this.fov;
            camera.aspect = this.aspect;
            camera.near = this.near;
            camera.far = this.far;
            camera.updateProjectionMatrix();

            this._requiresUpdate = false;
        }
    }

    protected onResize(newWidth: number, newHeight: number): void {
        this.width = newWidth;
        this.height = newHeight;
    }
}