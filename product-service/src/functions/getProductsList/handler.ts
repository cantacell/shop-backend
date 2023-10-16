import { formatJSONResponse } from '@libs/api-gateway';

import {ProductService} from "../../services/product-service";

export const getProductsList = async (event) => {
  console.log('request args', event.body, event.pathParameters, event.queryStringParameters);
  const productService = new ProductService();
  try {
    const products = await productService.getProductsList();
    return formatJSONResponse({body: products});
  } catch (err: any) {
    return formatJSONResponse({statusCode: 502, message: 'Internal server error'});
  }
};

