import {getProductById} from "@functions/getProductById/handler";

describe("getProductById tests", function() {
    it('Invoking the method passing an existing product id, a of product is returned', async () => {
        const request = {
            pathParameters: {
                productId: '7567ec4b-b10c-48c5-9345-fc73c48a80aa'
            }
        };
        const product = await getProductById(request);
        expect(product.statusCode).toEqual(200);
        expect(JSON.parse(product.body).product).toEqual({
            "count": 4,
            "description": "Short Product Description1",
            "id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
            "price": 2.4,
            "title": "ProductOne"
        })
    });

    it('Invoking the method passing an un-existing product id, a 404 error is returned', async () => {
        const request = {
            pathParameters: {
                productId: 'abc'
            }
        };
        const product = await getProductById(request);
        expect(product.statusCode).toEqual(404);
        expect(JSON.parse(product.body).message).toEqual("Product not found");
    });
});
