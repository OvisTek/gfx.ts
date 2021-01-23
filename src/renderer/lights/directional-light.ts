import { Color } from "../../math/color";
import { Euler } from "../../math/euler";
import { Vector3 } from "../../math/vector3";
import { Entity } from "../scriptable/entity";

export class DirectionalLight extends Entity {

    private readonly _color: Color;
    private readonly _dir: Euler = Euler.fromVector(new Vector3(0.5, 0.7, 1.0).normalise());

    constructor() {
        super({
            autoCreate: false,
            visibility: true
        });

        this._color = new Color(1, 1, 1, 1);
    }

    public get color(): Color {
        return this._color;
    }

    public get direction(): Euler {
        return this._dir;
    }
}