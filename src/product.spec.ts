import {Product} from "./product"

describe("Product Tests", function() {
    test("Load Product", function () {
        let product = Product.load('test1');
        // console.log(product);

        expect([
            product.code,
            product.name,
            product.description,
            product.price,
        ]).toEqual([
            'test1',
            'Test1',
            'Ad test one',
            99.99,
        ]);
    });

    test("Missing Product", function () {
        expect(() => Product.load("-1")).toThrow();
    });
});
