import { Camera } from "./camera";
import { Matrix4 } from "../../math/matrix4";

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

    private readonly _cameraMatrix: Matrix4;

    constructor(fov: number = 50, width: number = 1024, height: number = 1024, near: number = 0.1, far: number = 5000) {
        super();

        this._cameraMatrix = new Matrix4();

        this._fov = fov;
        this._width = width;
        this._height = height;
        this._near = near;
        this._far = far;

        // sets the camera matrix to the projection matrix
        this._cameraMatrix.setToProjection(this.near, this.far, this.fov, this.aspect);

        // no need to update until the variables change
        this._requiresUpdate = false;
    }

    public get fov(): number {
        return this._fov;
    }

    public set fov(value: number) {
        this._fov = value;
        this._requiresUpdate = true;
    }

    public get width(): number {
        return this._width;
    }

    public set width(value: number) {
        this._width = value;
        this._requiresUpdate = true;
    }

    public get height(): number {
        return this._height;
    }

    public set height(value: number) {
        this._height = value;
        this._requiresUpdate = true;
    }

    public get near(): number {
        return this._near;
    }

    public set near(value: number) {
        this._near = value;
        this._requiresUpdate = true;
    }

    public get far(): number {
        return this._far;
    }

    public set far(value: number) {
        this._far = value;
        this._requiresUpdate = true;
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

    public get cameraMatrix(): Matrix4 {
        return this._cameraMatrix;
    }

    public get cameraMatrixInverse(): Matrix4 {
        return this.cameraMatrixInverse;
    }

    protected update(dt: number) {
        if (this._requiresUpdate) {
            // resets the projection matrix to the new values
            this._cameraMatrix.setToProjection(this.near, this.far, this.fov, this.aspect);

            this._requiresUpdate = false;
        }
    }
}