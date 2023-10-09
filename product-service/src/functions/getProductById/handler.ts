import { formatJSONResponse } from '@libs/api-gateway';

import {ProductService} from "../../services/product-service";

export const getProductById = async (event) => {
  let productId: string = undefined;
  try {
    productId = event.pathParameters.productId;
  } catch (err: any) {
    return formatJSONResponse({message: 'Bad request', statusCode: 400});
  }

  const productService = new ProductService()
  const product = await productService.getProductById(productId);
  if (product)
    return formatJSONResponse({body: {product: product}});
  else
    return formatJSONResponse({statusCode: 404, body: {message: 'Product not found'}});
};
