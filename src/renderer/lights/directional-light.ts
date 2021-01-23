import { Color } from "../../math/color";
import { Euler } from "../../math/euler";
import { Entity } from "../scriptable/entity";

export class DirectionalLight extends Entity {

    private readonly _color: Color;

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
        return this.transform.euler;
    }
}