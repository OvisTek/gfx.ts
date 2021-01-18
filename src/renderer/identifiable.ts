import { GlobalID } from "../math/global-id";

/**
 * Every object that wants to be unique can extend this object
 * which will assign a unique ID
 */
export abstract class Identifiable {
    private readonly _id: number;

    constructor() {
        this._id = GlobalID.generate();
    }

    public get id(): number {
        return this._id;
    }

    /**
     * Check if the other object is the same as this object
     * 
     * @param other - the object to check
     */
    public is(other: Identifiable | undefined): boolean {
        return other != undefined ? this._id === other._id : false;
    }
}