import {products} from "./products";
import {Product} from "../interfaces/product";

export class ProductService {
    async getProductById(id: string): Promise<Product> {
        return new Promise((resolve) => {
            const product = products.find((p: Product) => {
                return p.id === id;
            });
            resolve(product);
        });
    }

    async getProductsList(): Promise<Array<Product>> {
        return new Promise((resolve) => {
           resolve(products);
        });
    }
}