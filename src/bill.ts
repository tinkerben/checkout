import * as _ from "lodash";

/**
 * Describes a discount applied to a product
 */
export class Discount {
    private type: any;
    private description: any;
    private amount: any;
    /**
     * Create a Discount
     *
     * @param {string} type
     * @param {string} description
     * @param {Number} amount
     */
    constructor(type: any, description: any, amount: any) {
        this.type = type;
        this.description = description;
        this.amount = amount;
    }
}

/**
 * A BillItem represents a single product line item during bill analysis.
 */
export class BillItem {
    private productCode: any;
    private price: null;
    private discount: null;
    /**
     * Create a BillItem
     *
     * @param {string} productCode
     */
    constructor(productCode: any) {
        this.productCode = productCode;
        this.price = null;
        this.discount = null
    }

    setDiscount(type: any, description: any, amount: any) {
        // @ts-ignore
        this.discount = new Discount(type, description, amount);
    }

    /**
     * Calculate the cost of this item, including any applied discounts
     *
     * @return {Number} cost
     */
    total() {
        if ( this.price === null ) {
            throw new Error('Pricing missing from bill item');
        }
        
        // @ts-ignore
        return this.price - (this.discount ? this.discount.amount : 0);
    }
}

/**
 * A Bill represents the line-by-line cost of a series of products
 */
export class Bill {
    private items: BillItem[];
    /**
     * Create a Bill
     *
     * @param {BillItem} items
     */
    constructor(items: any[]) {
        this.items = items.map(x => new BillItem(x));
    }

    /**
     * Calculate the total cost for all line items in this bill, including applied discounts
     *
     * @return {Number} cost
     */
    total() {
        return _.sumBy(this.items, item => item.total());
    }
}
