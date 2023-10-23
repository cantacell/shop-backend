import {formatJSONResponse} from '@libs/api-gateway';
import {S3Client, PutObjectCommand, PutObjectCommandInput} from '@aws-sdk/client-s3';
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.IMPORT_BUCKET_NAME;
const catalogPath = 'uploaded/';

export const importProductsFile  = async (event) => {
  console.log('request args', event.queryStringParameters);
  let params: PutObjectCommandInput;
  try {
    if (!event.queryStringParameters.name || event.queryStringParameters.name === '')
      throw Error();
    params = {
      Bucket: BUCKET,
      Key: catalogPath + event.queryStringParameters.name,
      ContentType: 'text/csv'
    };
  } catch (err: any) {
    return formatJSONResponse({message: 'Bad request', statusCode: 400});
  }

  const client = new S3Client();
  const command = new PutObjectCommand(params);
  try{
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    return formatJSONResponse({statusCode: 200, body: signedUrl});
  } catch (err) {
    return formatJSONResponse({statusCode: 502, body: {message: err.message}});
  }
};
