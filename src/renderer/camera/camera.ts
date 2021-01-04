import { Matrix4 } from "../../math/matrix4";
import { Entity } from "../scriptable/entity";

/**
 * All cameras are scene entities like any other as such are part
 * of the Scene-Graph
 */
export abstract class Camera extends Entity {

    constructor() {
        super({
            visibility: true,
            autoCreate: false
        });
    }

    public abstract get cameraMatrix(): Matrix4;
    public abstract get cameraMatrixInverse(): Matrix4;
    public abstract get isPerspective(): boolean;
    public abstract get isOrthographic(): boolean;
}