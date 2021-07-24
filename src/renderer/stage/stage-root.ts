import { Entity } from "./entity";
import { Stage } from "./stage";

/**
 * StageRoot is a special Entity that is by default the parent of all entities
 */
export class StageRoot extends Entity {
    constructor(stage: Stage) {
        super({
            visibility: true,
            autoCreate: false
        });

        this._stage = stage;
    }

    public get isRoot(): boolean {
        return true;
    }
}