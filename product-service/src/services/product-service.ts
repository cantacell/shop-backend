import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocument,
    TransactWriteCommandInput,
    QueryCommandInput
} from "@aws-sdk/lib-dynamodb"
import { randomUUID } from 'node:crypto';
const dynamoV3 = new DynamoDBClient({region: 'us-east-1'});
const dynamoDBDocClient = DynamoDBDocument.from(dynamoV3);

import {Product} from "../interfaces/product";
import {ProductWithStock} from "../interfaces/product-with-stock";
import {Stock} from "../interfaces/stock";

export class ProductService {
    getTransactNewProduct(item: ProductWithStock) {
        item.id = randomUUID();
        const transactCommandInput: TransactWriteCommandInput = {
            TransactItems: [
                {
                    Put: {
                        Item: {
                            id: item.id,
                            title: item.title,
                            price: item.price,
                            description: item.description
                        },
                        TableName: process.env.PRODUCTS_TABLE,
                    },
                },
                {
                    Put: {
                        Item: {
                            product_id: item.id,
                            count: item.count
                        },
                        TableName: process.env.STOCKS_TABLE,
                    },
                }
            ],
        };
        return transactCommandInput;
    }

    async createProduct(item: ProductWithStock) {
        return dynamoDBDocClient.transactWrite(this.getTransactNewProduct(item));
    }

    async batchCreateProduct(items: ProductWithStock[]) {
        const command = {
            TransactItems: items.map(p => this.getTransactNewProduct(p).TransactItems).flat(),
        };

        return dynamoDBDocClient.transactWrite(command);
    }

    async getProductById(id: string): Promise<Product> {
        const productQuery: QueryCommandInput = {
            TableName: process.env.PRODUCTS_TABLE,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {':id': id},
            Limit: 1
        }
        const productResult = await dynamoDBDocClient.query(productQuery)
        const product = productResult.Items[0] as ProductWithStock;
        if (product) {
            const stockResult = await dynamoDBDocClient.query({
                TableName: process.env.STOCKS_TABLE,
                KeyConditionExpression: 'product_id = :id',
                ExpressionAttributeValues: {':id': id},
                Limit: 1
            });
            if (stockResult?.Items?.length > 0)
                product.count = stockResult.Items[0].count;
        }
        return product;
    }

    async getProductsList(): Promise<Array<ProductWithStock>> {
        const products =  await dynamoDBDocClient.scan({
            TableName: process.env.PRODUCTS_TABLE
        });

        const stocks =  await dynamoDBDocClient.scan({
            TableName: process.env.STOCKS_TABLE
        });

        products.Items.forEach((p: ProductWithStock) => {
            const stock = stocks.Items.find((s: Stock) => {
                return s.product_id === p.id;
            });
            if (stock)
                p.count = stock.count;
            else
                p.count = 0;
        });
        return products.Items as ProductWithStock[];
    }
}