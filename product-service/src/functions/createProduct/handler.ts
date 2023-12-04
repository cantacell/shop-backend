import {formatJSONResponse} from '@libs/api-gateway';

import {APIGatewayProxyResult} from "aws-lambda";
import {ProductWithStock} from "../../interfaces/product-with-stock";
import {ProductService} from "../../services/product-service";

export const createProduct  = async (event) => {
  console.log('request args', event.body, event.pathParameters, event.queryStringParameters);
  let newProduct: ProductWithStock;
  try {
    newProduct = JSON.parse(event.body);
  } catch (err) {
    return formatJSONResponse({
      statusCode: 415,
    });
  }
  const productService = new ProductService();
  try {
    const putResult = await productService.createProduct(newProduct);
    if (putResult)
      return formatJSONResponse({
        statusCode: 200,
      }) as APIGatewayProxyResult;
    else
      return formatJSONResponse({
        statusCode: 400,
      }) as APIGatewayProxyResult;
  } catch (err) {
    return formatJSONResponse({statusCode: 502, body: {message: err.message}});
  }
};
