process.env.IMPORT_BUCKET_NAME = "sls-import-bucket";
import * as s3RequestPresigner from '@aws-sdk/s3-request-presigner/dist-cjs/getSignedUrl';
import sinon from 'sinon';

import {importProductsFile} from "../importProductsFile/handler";

describe("ImportProductsFile tests", () => {
    it("get a pre-signed url", async () => {
        const data = {
            queryStringParameters: {
                name: 'file.csv'
            }
        };
        const sandbox = sinon.createSandbox();
        const signedUrlResponse = "https://sls-import-bucket.s3.us-east-1.amazonaws.com/uploaded/csvfile.csv?X-Amz-Algorithm=";
        sandbox.stub(s3RequestPresigner, 'getSignedUrl').resolves(signedUrlResponse);
        const result = await importProductsFile(data);
        sandbox.restore(); // Unwraps the spy

        expect(result.body).toEqual("\"https://sls-import-bucket.s3.us-east-1.amazonaws.com/uploaded/csvfile.csv?X-Amz-Algorithm=\"");
    });

    it("not get a pre-signed url", async () => {
        const data = {
            queryStringParameters: {
                anotherParameter: '...'
            }
        };
        const sandbox = sinon.createSandbox();
        const signedUrlResponse = "";
        sandbox.stub(s3RequestPresigner, 'getSignedUrl').resolves(signedUrlResponse);
        const result = await importProductsFile(data);
        sandbox.restore(); // Unwraps the spy

        expect(result.body).toBeUndefined();
        expect(result.statusCode).toEqual(400);
    });
});