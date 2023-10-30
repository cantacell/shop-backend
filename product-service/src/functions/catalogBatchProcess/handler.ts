import {SQSEvent} from "aws-lambda";
import {SNSClient, PublishCommand, PublishCommandInput} from "@aws-sdk/client-sns";
import {ProductWithStock} from "../../interfaces/product-with-stock";
import {ProductService} from "../../services/product-service";

const ACCOUNT_ID = process.env.ACCOUNT_ID;
const SNS_TOPIC = process.env.SNS_TOPIC;

export const catalogBatchProcess  = async (event: SQSEvent) => {
  console.log('request args', event.Records, ACCOUNT_ID);
  const productService = new ProductService();
  const productsToCreate: ProductWithStock[] = [];
  for (const record of event.Records) {
    productsToCreate.push(JSON.parse(record.body));
  }

  const putResult = await productService.batchCreateProduct(productsToCreate);
  console.log('putResult', putResult);
  for (const product of productsToCreate) {
    const snsCommandInput: PublishCommandInput = {
      Message: 'new product is added to DB ' + JSON.stringify(product),
      Subject: 'New Product ' + product.title + ' is added',
      TopicArn: "arn:aws:sns:us-east-1:"+ACCOUNT_ID+":"+SNS_TOPIC,
      MessageAttributes: {
        productPrice: {
          DataType: "Number",
          StringValue: `${product.price}`,
        },
      },
    }
    console.log('topicarn', snsCommandInput.TopicArn);

    const snsCommand = new PublishCommand(snsCommandInput);
    const snsClient = new SNSClient();
    const snsResult = await snsClient.send(snsCommand);
    console.log('snsResult', snsResult);
  }

  return event.Records.length;
};
