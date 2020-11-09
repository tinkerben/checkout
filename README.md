# Code Challenge

## Assumptions
- Approaching the challenge as a backend API (implementation is not a complete 
solution but rather a proof of concept)
- Expecting items in the cart to be within the hundreds at most, just considering
the nature of the product. Code is implemented with the aim to be performant under 
such consideration
- Despite earlier assumption, the checkout system could potentially be requested by
a large number of simultaneous requests, it is critical that the processing be 
efficient. Code is implemented with the aim to be performant under such consideration
- The inclusion of test-results on repo is for review purposes

## Issues to be solved
- Be able to accurately calculate the total for items added for checkout
- Total calculation for items in checkout need to factor in the various discount rules
- Be able to efficiently factor the various discount rules (knapsack problem)

## Tools
- docker: can be used to run the implementation

## Quick Start

Using Docker...
```
$ npm run docker:up
```
(once in the container)
```
$ npm start 
```

or without...

**Prerequisites**
- nodejs/npm
```shell
$ npm i
$ npm run build
$ npm start
```

## Run Tests

Unit tests are on .spec.ts files

`data.ts` can be used to include more test scenarios. The below are the schemas used:
- customers {
    id,
    name
  }
- products {
    customerId, 
    productCode, 
    price
  }  
- priceDeals {
  customerId, 
  productCode, 
  price
}
- moreForLessDeals {
    customerId, 
    productCode, 
    purchaseSize, 
    costSize  
  }

```shell
$ npm test
```

## TODO
- Implement actual database 
- Implement proper currency handling (potentially with use of Dinero)
- Implement GraphQL for data query (given the push to use the graph more uniformly)
