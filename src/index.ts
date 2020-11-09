import {PricingRules} from "./models/pricing";
import {CheckOut} from "./models/checkOut";
import * as readline from "readline";

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Which customer ID would you like to test? ", (answer) => {
    if (answer) {
        let customerId = parseInt(answer);
        let pricingRules = PricingRules.load(customerId);
        let checkOut = new CheckOut(pricingRules);

        for (let i = 0; i < 5; i++) {
            checkOut.add('test1');
        }

        console.log(checkOut.total());
    }

    rl.close();
});


