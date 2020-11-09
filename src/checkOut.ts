import { Bill } from "./bill";

/**
 * A Checkout tracks a users product selections and allows calculation
 * of the associated cost.
 *
 * Currently it's a simple in-memory implementation, but we could easily utilise
 * storage instead to implement persistent state.
 */
export class CheckOut {
    private pricingRules: any;
    private items: any[];

    /**
     * Create a Checkout
     *
     * @param {PricingRules} pricingRules
     */
    constructor(pricingRules: any) {
        this.pricingRules = pricingRules;
        this.items = [];
    }

    /**
     * Add an item to the current checkout
     *
     * @param {string} productCode
     */
    add(productCode: any) {
        this.items.push(productCode);
    }

    /**
     * Calculate the total cost of the current items, applying relevant customer discounts
     *
     * @return {Number} Total cost
     */
    total() {
        const bill = new Bill(this.items);
        this.pricingRules.apply(bill);
        return bill.total();
    }
}
