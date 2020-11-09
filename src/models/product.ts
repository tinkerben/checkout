import { productLookup } from "../database/data"

export class Product  {
    public code: string;
    public name: string;
    public description: string;
    public price: number;
    
    constructor(code: string, name: string, description: string, price: number) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.price = price;
    }
    
    public static load(code: string) {
        const data = productLookup[code];

        if (! data) {
            throw new Error('Missing product');
        }

        // @ts-ignore
        return new this(data[0], data[1], data[2], data[3]);
    }
}
