import * as _ from "lodash";

const customers = [
    [1, 'SecondBite'],
    [2, 'Axil Coffee Roasters'],
    [3, 'MYER'],
    [4, 'default'],
    [5, 'TEST'],
    [6, 'TEST2'],
    [7, 'TEST3'],
];

export const customerLookup = _.keyBy(customers, 0);

const products = [
    // code, name, description, price
    [
        'classic',
        'Classic Ad',
        'Offers the most basic level of advertisement',
        269.99
    ],
    [
        'standout',
        'Stand out Ad',
        'Allows advertisers to use a company logo and use a longer presentation text',
        322.99
    ],
    [
        'premium',
        'Premium Ad',
        'Same benefits as Standout Ad, but also puts the advertisement at the top of the results, allowing higher visibility',
        394.99
    ],
    [
        'test1',
        'Test1',
        'Ad test one',
        99.99
    ],
    [
        'test2',
        'Test2',
        'Ad test two',
        111.00
    ],
];

export const productLookup = _.keyBy(products, 0);

const priceDeals = [
    // customerId, productCode, price
    [2, 'standout', 299.99],
    [3, 'premium', 389.99],

    // test deals
    [5, 'standout', 299.99, 0],
    [5, 'test1', 150, 0],
    [5, 'test1', 200, 0],
    [6, 'test1', 150, 0],
    [6, 'test1', 200, 0],
    [7, 'test1', 150, 3],
    [7, 'test1', 200, 2],
];

export const priceDealLookup: any = {};

for (const deal of priceDeals) {
    let customerId = deal[0];
    if (!(customerId in priceDealLookup)) {
        priceDealLookup[customerId] = [];
    }
    priceDealLookup[customerId].push(deal);
}

const moreForLessDeals = [
    // customerId, productCode, purchaseSize, costSize
    [1, 'classic', 3, 2],
    [1, 'classic', 30, 13],
    [3, 'standout', 5, 4],

    // test deals
    [5, 'classic', 6, 4],
    [5, 'classic', 20, 12],
    [5, 'classic', 30, 15],

    [5, 'premium', 6, 4],
    [5, 'premium', 20, 12],
    [5, 'premium', 30, 15],

    [5, 'test1', 2, 1], // not as good as the price deal
    [5, 'test2', 2, 1], // better than the price deal

    [6, 'test1', 2, 1],
    [6, 'test2', 5, 2],
];

export const moreForLessDealLookup: any = {};

for (const deal of moreForLessDeals) {
    let customerId = deal[0];
    if (!(customerId in moreForLessDealLookup)) {
        moreForLessDealLookup[customerId] = [];
    }
    moreForLessDealLookup[customerId].push(deal);
}



