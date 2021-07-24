export class Util {

    /**
     * Checks if the Object is a Promise type or not
     * @param obj - the object to check
     * @returns - true if the object is a Promise, false otherwise
     */
    public static isPromise(obj: any | null): boolean {
        return !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
    }

    /**
     * Removes an object from the provided Array
     * @param array - the array to remove an object from
     * @param object - the object to remove
     * @returns - true if the object was removed, false otherwise
     */
    public static removeFromArray(array: any, object: any): boolean {
        const index: number = array.indexOf(object);

        if (index > -1) {
            array.splice(index, 1);

            return true;
        }

        return false;
    }
}