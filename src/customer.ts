import {customerLookup} from "./database/data";

export class Customer {
    public id: number;
    public name: string;

    /**
     * Create a Customer
     *
     * @param {Number} id
     * @param {string} name
     */
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    /**
     * Load a customer record from state/storage
     *
     * @param {Number} id
     */
    static load(id: number) {
        const data = customerLookup[id];
        if (! data) {
            throw new Error('Missing customer');
        }
        // @ts-ignore
        return new this(...data);
    }
}

