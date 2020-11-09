import * as _ from "lodash";

export function priceDealHandler(items: any, targetWeight: any) {
    let result = {
        cost: null,
        allocations: [],
    };

    // Trim down the problem space - avoid searching against pointless items.
    items = items.filter((item: { weight: any; }) => (item.weight <= targetWeight));
    if (items.length === 0) {
        return [];
    }

    // Sort the items by descending profit to ensure we try the highest profit items first
    // hoping to help with later branch pruning.
    items = _.sortBy(items, item => item.cost / item.weight);

    greedyBAndBPlanTreeWalk(items, targetWeight, 0, [], result);
    return result.allocations;
}

/**
 * Recursive tree walk to find the minimum cost way to meet the target weight.
 *
 * @param {Array} items - the item types, assumed to be ordered by descending profitability
 * @param {Number} targetWeight - remaining target weight to achieve
 * @param {Number} totalCost - the cost of all items already allocated
 * @param {Array}  allocations - an array tracking the allocations made so far
 * @param {object} result - contains the current best cost and allocations list that solves the problem
 */
function greedyBAndBPlanTreeWalk(items: any, targetWeight: any, totalCost: any, allocations: any, result: any) {
    // Trim down the problem space - avoid searching against pointless items.
    items = items.filter((item: { weight: any; }) => item.weight <= targetWeight);

    if (items.length === 0) {
        // no more solutions to be found => prune branch
        return;
    }

    if (items.length === 1) {
        // A leaf on the tree
        let item = items[0];
        if (targetWeight % item.weight === 0) {
            let allocation = targetWeight / item.weight;
            totalCost += allocation * item.cost;
            if ( (result.cost === null) || (totalCost < result.cost) ) {
                result.cost = totalCost;
                result.allocations = [...allocations, {item, allocation}];
            }
        }
        return;
    }

    let item = items[0];
    let newAllocations, newTotalCost, newTargetWeight;

    // Greedy match the items, i.e. try biggest allocation you can and then work back to smaller
    // candidate allocations.
    for (let allocation = Math.floor(targetWeight / item.weight); allocation >= 0; allocation--) {

        if ( allocation > 0 ) {
            newAllocations = [...allocations, {item, allocation}];
            newTotalCost = totalCost + (allocation * item.cost);
            newTargetWeight = targetWeight - (allocation * item.weight);
        } else {
            // skip this item
            newAllocations = allocations;
            newTotalCost = totalCost;
            newTargetWeight = targetWeight;
        }

        if (newTargetWeight === 0) {
            // Exact match, another leaf case for the tree.
            // Prune the rest of these sub-branches as they will only rely on higher cost items anyway.
            if ( (result.cost === null) || (newTotalCost < result.cost) ) {
                result.cost = newTotalCost;
                result.allocations = newAllocations;
            }
            return;
        }

        if ( (result.cost !== null) && (newTotalCost > result.cost) ) {
            return;
        }

        greedyBAndBPlanTreeWalk(
            items.slice(1),
            newTargetWeight,
            newTotalCost,
            newAllocations,
            result
        );
    }
}
