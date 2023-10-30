import {randomUUID} from "node:crypto";
jest.mock("node:crypto", () => ({
    randomUUID: jest.fn(() => 'fakeId'),
}));

process.env.PRODUCTS_TABLE = "products";
process.env.STOCKS_TABLE = "stocks";
process.env.SNS_TOPIC='create-product';

import {mockClient} from 'aws-sdk-client-mock';
import {SNSClient, PublishCommand} from "@aws-sdk/client-sns";
import {TransactWriteItemsCommand} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb"
import {catalogBatchProcess} from "@functions/catalogBatchProcess/handler";
import {SQSEvent} from "aws-lambda";

const snsMock = mockClient(SNSClient);
const dynamoMock = mockClient(DynamoDBDocument);
snsMock
    .on(PublishCommand, {
        Message: 'My message',
    })
    .resolves({
        MessageId: '12345678-4444-5555-6666-111122223333',
    });
dynamoMock.on(TransactWriteItemsCommand, {}).resolves({});

describe.only("catalogBatchProcess tests", function() {
    beforeEach(() => {
        snsMock.reset();
        dynamoMock.reset();
    });
    it('should add product to the database and send notification', async () => {
        const idMock = randomUUID();
        const sqsEvent: SQSEvent = {
            Records: [{
                body: '{"title":"Testbook","description":"testbook description","price":"19","count":"11","id":"'+idMock+'"}',
                messageId: '123',
                attributes: {
                    ApproximateReceiveCount: '',
                    SentTimestamp: '',
                    SenderId: '',
                    ApproximateFirstReceiveTimestamp: ''
                },
                receiptHandle: '',
                messageAttributes: {body: {dataType: 'String'}},
                md5OfBody: '',
                eventSource: '',
                awsRegion: '',
                eventSourceARN: ''
            }]
        };

        const expectedSNSMessage = {
            Message: 'new product is added to DB ' + sqsEvent.Records[0].body,
            Subject: 'New Product ' + JSON.parse((sqsEvent.Records[0].body)).title + ' is added',
            MessageAttributes: {
                productPrice: {
                    DataType: "Number",
                    StringValue: "19",
                }
            },
            TopicArn: 'arn:aws:sns:us-east-1:undefined:create-product'
        };

        const result = await catalogBatchProcess(sqsEvent);
        expect(snsMock.call(0).args[0].input).toEqual(expectedSNSMessage);
        expect(result).toEqual(1);
        expect(snsMock.calls()).toHaveLength(1);
        expect(dynamoMock.calls()).toHaveLength(1);
    })
});
