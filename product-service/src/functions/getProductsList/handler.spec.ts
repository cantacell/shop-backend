import {getProductsList} from "@functions/getProductsList/handler";

describe("getProductsList tests", function() {
    it.only('Invoking the method a list of products is returned', async () => {
        const products = await getProductsList();
        expect(products.statusCode).toEqual(200);
        expect(JSON.parse(products.body).length).toBeGreaterThan(0);
    });
});
