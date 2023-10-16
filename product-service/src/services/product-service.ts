import {DynamoDB} from 'aws-sdk';
import { randomUUID } from 'node:crypto';
const dynamo = new DynamoDB.DocumentClient();

import {Product} from "../interfaces/product";
import {Stock} from "../interfaces/stock";
import {ProductWithStock} from "../interfaces/product-with-stock";

export class ProductService {
    async createProduct(item: ProductWithStock) {
        item.id = randomUUID();
        return dynamo.transactWrite({
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
        }).promise();
    }

    async getProductById(id: string): Promise<Product> {
        const productResult = await dynamo.query({
            TableName: process.env.PRODUCTS_TABLE,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {':id': id},
            Limit: 1
        }).promise();
        const product = productResult.Items[0] as ProductWithStock;
        if (product) {
            const stockResult = await dynamo.query({
                TableName: process.env.STOCKS_TABLE,
                KeyConditionExpression: 'product_id = :id',
                ExpressionAttributeValues: {':id': id},
                Limit: 1
            }).promise();
            if (stockResult?.Items?.length > 0)
                product.count = stockResult.Items[0].count;
        }
        return product;
    }

    async getProductsList(): Promise<Array<ProductWithStock>> {
        const products =  await dynamo.scan({
            TableName: process.env.PRODUCTS_TABLE
        }).promise();

        const stocks =  await dynamo.scan({
            TableName: process.env.STOCKS_TABLE
        }).promise();

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