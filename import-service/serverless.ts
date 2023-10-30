import type { AWS } from '@serverless/typescript';

import importProductsFile from '@functions/importProductsFile';
import importFileParser from "@functions/importFileParser";

const serverlessConfiguration: AWS = {
  useDotenv: true,
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      IMPORT_BUCKET_NAME: '${env:IMPORT_BUCKET_NAME}',
      CATALOG_QUEUE_NAME: '${env:CATALOG_QUEUE_NAME}'
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['s3:*'],
            Resource: "arn:aws:s3:::${self:provider.environment.IMPORT_BUCKET_NAME}/*"
          },
          {
            "Action": ["sqs:SendMessage"],
            "Resource": [
              "arn:aws:sqs:us-east-1:${aws:accountId}:${self:provider.environment.CATALOG_QUEUE_NAME}"
            ],
            "Effect": "Allow"
          }
        ]
      }
    }
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
  resources: {
    Resources: {
        // Specifying the S3 Bucket
        ImportBucket: {
          Type: 'AWS::S3::Bucket',
          Properties: {
            BucketName: "${self:provider.environment.IMPORT_BUCKET_NAME}",
            CorsConfiguration: {
              CorsRules: [
                  {
                    AllowedMethods: ['GET', 'PUT'],
                    AllowedOrigins: ["*"],
                    AllowedHeaders: ["*"]
                  }
              ]
            }
          },
        }
    }
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
