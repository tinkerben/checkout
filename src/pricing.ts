import * as _ from "lodash";
import {moreForLessDealLookup, priceDealLookup} from "./database/data";
import {priceDealHandler} from "./priceDealHandler";
import {Product} from "./product";

/**
 * Abstract class describing the interface common to all Deal types
 */
class AbstractDeal {
    /**
     * Apply this deal to a set of BillItems, updating the items with any
     * resulting discount.
     *
     * @param {BillItem[]} billItems
     */
    apply(billItems: any) {};

    /**
     * Load all deals of this type for the customer out of state/storage
     *
     * @param {Number} customerId
     * @return {AbstractDeal[]} deals
     */
    static load(customerId: number) { return []; }
}

/**
 * A priceDeal lowers the price of a given product to a new fixed price
 */
export class priceDeal extends AbstractDeal {
    private customerId: number;
    private productCode: string;
    price: number;
    private triggerSize: any;

    /**
     * Create a priceDeal
     *
     * @param {Number} customerId
     * @param {string} productCode
     * @param {Number} price
     * @param {Number|undefined|null} triggerSize - the number of items that must be purchased to trigger this deal
     */
    constructor(customerId: number, productCode: string, price: number, triggerSize: any) {
        super();
        this.customerId = customerId;
        this.productCode = productCode;
        this.price = price;
        this.triggerSize = triggerSize || 0;
    }

    apply(billItems: any) {
        for ( const item of billItems ) {
            item.setDiscount("priceDealHandler", 'price discount deal', Math.max(item.price - this.price, 0));
        }
    };

    static load(customerId: number) {
        let deals = priceDealLookup[customerId] || [];
        // @ts-ignore
        return deals.map((dealData: any) => new this(...dealData));
    }
}

/**
 * A moreForLessDeal allows the consumer to buy N items of a product for the price of only M items.
 */
export class moreForLessDeal extends AbstractDeal {
    private customerId: number;
    private productCode: string;
    private purchaseSize: any;
    private costSize: any;
    private description: string;
    /**
     * Create a PriceDeal
     *
     * @param {Number} customerId
     * @param {string} productCode
     * @param {Number} purchaseSize - N
     * @param {Number} costSize - M
     */
    constructor(customerId: number, productCode: string, purchaseSize: any, costSize: any) {
        super();
        this.customerId = customerId;
        this.productCode = productCode;
        this.purchaseSize = purchaseSize;
        this.costSize = costSize;
        this.description = `${this.purchaseSize} for ${this.costSize} deal`;
    }

    apply(billItems: any[]) {
        while (billItems.length >= this.purchaseSize) {
            let batch = billItems.splice(0, this.purchaseSize);
            // Leave the price of the first M items alone, then discount the
            // remaining (N-M) to zero cost.
            batch.forEach(
                (item, idx) => {
                    if ( idx >= this.costSize ) {
                        item.setDiscount("moreForLessDeal", this.description, item.total());
                    }
                }
            );
        }
    };

    static load(customerId: number) {
        let deals = moreForLessDealLookup[customerId] || [];
        // @ts-ignore
        return deals.map((dealData: any) => new this(...dealData));
    }

    /**
     * Calculate the resulting price of a product when this deal is applied
     *
     * @param {Number} price - the standard price for the product
     * @return {Number} effective price
     */
    effectivePrice(price: number) {
        return (this.costSize / this.purchaseSize) * price;
    }

    /**
     * Determine the most cost efficient way to apply a set of moreForLessDeals.
     *
     * For small numbers of deals and items this is a quick problem to solve. But for large inputs
     * and worst-case data it is a computationally hard problem, a slight variation on the
     * Knapsack problem or M-Partition problem.
     *
     * @param {moreForLessDeal[]} deals
     * @param {Number} numItems - the number of items to allocate
     * @param {Number} stdPrice - the ordinary price to charge for this product inside an moreForLessDeal
     * @param {Number} discountPrice - the price we can charge for items not allocated to an moreForLessDeal
     */
    static findBestAllocationPlan(deals: any[], numItems: any, stdPrice: number, discountPrice: number) {

        // Trim down the problem space - avoid searching against pointless deals.
        deals = deals.filter(deal => (deal.effectivePrice(stdPrice) < discountPrice));
        if (deals.length === 0) {
            return [];
        }

        let knapsackItems = deals.map(deal => ({
            weight: deal.purchaseSize,
            cost: deal.effectivePrice(stdPrice) * deal.costSize,
            deal: deal,
        }));
        // Presort by weight, as it looks better in the output to choose bigger deals when a big deal
        // happens to have the same effective price as a smaller deal.
        knapsackItems = _.sortBy(knapsackItems, 'weight').reverse();
        // Add a single item purchase option for the algorithm to complete the matches
        knapsackItems.push({weight: 1, cost: discountPrice, deal: null});

        let plan = priceDealHandler(knapsackItems, numItems);

        let allocations = plan.map(x => ({
            // @ts-ignore
            deal: x.item.deal,
            // @ts-ignore
            allocation: x.allocation,
        }));

        return allocations;
    }
}

export class PricingRules {
    private priceDeals: any;
    private moreForLessDeals: any;
    
    constructor(priceDeals: any, moreForLessDeals: any) {
        this.priceDeals = priceDeals;
        this.moreForLessDeals = moreForLessDeals;
    }

    /**
     * Apply this pricing model to a Bill
     *
     * @param {Bill} bill
     */
    apply(bill: { items: any; }) {
        for (const item of bill.items) {
            item.price = Product.load(item.productCode).price;
            item.discount = null;
        }

        let productGroups = _.groupBy(bill.items, 'productCode');

        for (const [productCode, productItems] of Object.entries(productGroups)) {
            this._applyProductDeals(productCode, productItems);
        }
    }

    /**
     * Apply any discounts applicable to a specific product
     *
     * @param {string} productCode
     * @param {BillItem[]} productItems
     * @private
     */
    _applyProductDeals(productCode: string, productItems: any[]) {

        // determine pricing to apply

        const stdPrice = Product.load(productCode).price;

        let {priceDeal, moreForLessDeals} = this._resolveProductDeals(productCode, stdPrice, productItems.length);
        if ((!priceDeal) && (moreForLessDeals.length === 0)) {
            return; // No deals to apply
        }

        // @ts-ignore
        let price = priceDeal ? priceDeal.price : stdPrice;


        // Now apply all the deals

        const remainingProductItems = [...productItems];

        let moreForLessAllocationPlan = moreForLessDeal.findBestAllocationPlan(moreForLessDeals, productItems.length, stdPrice, price);
        for (const {deal, allocation} of moreForLessAllocationPlan) {
            if (deal) {
                let dealItems = remainingProductItems.splice(0, allocation * deal.purchaseSize);
                deal.apply(dealItems);
            }
        }

        if (priceDeal) {
            // @ts-ignore
            priceDeal.apply(remainingProductItems);
        }
    }

    /**
     * Determine the best discounts applicable to a specific product.
     *
     * @param {string} productCode
     * @param {Number} productPrice
     * @param {Number} numItems
     * @return {object} A deal lookup by type
     * @private
     */
    _resolveProductDeals(productCode: string, productPrice: number, numItems: number) {
        let priceDeal = null;
        let pricingDeals = this.priceDeals.filter(
            (deal: { productCode: string; price: number; triggerSize: number; }) =>
                (deal.productCode === productCode) &&
                (deal.price < productPrice) &&
                (deal.triggerSize <= numItems)
        );
        if (pricingDeals.length) {
            priceDeal = _.minBy(pricingDeals, 'price');
        }

        let moreForLessDeals = this.moreForLessDeals.filter(
            (deal: { productCode: string; effectivePrice: (arg0: number) => number; }) => (deal.productCode === productCode) && (deal.effectivePrice(productPrice) < productPrice)
        );

        return {priceDeal, moreForLessDeals};
    }

    /**
     * Load a pricing rules for a given customer from state/storage
     *
     * @param {Number} customerId
     */
    static load(customerId: number) {
        return new this(priceDeal.load(customerId), moreForLessDeal.load(customerId));
    }
}

