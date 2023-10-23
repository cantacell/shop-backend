import {formatJSONResponse} from '@libs/api-gateway';
import {S3Client, CopyObjectCommand, CopyObjectCommandInput, GetObjectCommand, GetObjectCommandInput,
  DeleteObjectCommand} from '@aws-sdk/client-s3';
import {S3Event} from "aws-lambda";
import csv from 'csv-parser';

const BUCKET = process.env.IMPORT_BUCKET_NAME;
const uploadedPath = 'uploaded/';
const parsedPath = 'parsed/'

export const importFileParser  = async (event: S3Event) => {
  for (const record of event.Records) {
    console.log('record key', record.s3.object.key, 'destination key', record.s3.object.key.replace(uploadedPath, parsedPath));
    const copyParams: CopyObjectCommandInput = {
      Bucket: BUCKET,
      CopySource: BUCKET + '/' + record.s3.object.key,
      Key: record.s3.object.key.replace(uploadedPath, parsedPath),
      ContentType: 'text/csv'
    };

    const client = new S3Client();
    const copyCommand = new CopyObjectCommand(copyParams);
    await client.send(copyCommand);

    // Convert csv file
    const getParams: GetObjectCommandInput = {
      Bucket: BUCKET,
      Key: record.s3.object.key.replace(uploadedPath, parsedPath)
    };

    const getCommand = new GetObjectCommand(getParams);
    const stream = await client.send(getCommand);
    const results = [];
    stream.Body.pipe(csv())
        .on('data', (data) => {
          console.log(data);
          results.push(data);
        })
        .on('end', () => {
          console.log(results);
        });

    const deleteParams = {
      Bucket: BUCKET,
      Key: record.s3.object.key
    };

    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await client.send(deleteCommand);
  }

  return formatJSONResponse({statusCode: 200, body: ''});
};
