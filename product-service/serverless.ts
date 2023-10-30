import type { AWS } from '@serverless/typescript';

import getProductsList from '@functions/getProductsList';
import getProductById from '@functions/getProductById';
import createProduct from '@functions/createProduct';
import catalogBatchProcess from '@functions/catalogBatchProcess';

const serverlessConfiguration: AWS = {
  useDotenv: true,
  service: 'product-service',
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
      PRODUCTS_TABLE: '${env:PRODUCTS_TABLE}',
      STOCKS_TABLE: '${env:STOCKS_TABLE}',
      CATALOG_QUEUE_NAME: '${env:CATALOG_QUEUE_NAME}',
      ACCOUNT_ID: '${aws:accountId}',
      SNS_TOPIC: '${env:SNS_TOPIC}'
    },
    iam: {
      role: {
        statements: [{
          Effect: 'Allow',
          Action: ['dynamodb:Query', 'dynamodb:Scan', 'dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:DeleteItem'],
          Resource: '*'
        },
        {
          "Effect": "Allow",
          "Action": [
            "sns:Publish"
          ],
          "Resource": [
            "arn:aws:sns:us-east-1:${aws:accountId}:${self:provider.environment.SNS_TOPIC}"
          ]
        }
        ]
      }
    }
  },
  // import the function via paths
  functions: { getProductsList, getProductById, createProduct, catalogBatchProcess },
  resources: {
    Resources: {
      products: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.PRODUCTS_TABLE}",
          AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
          KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
          ProvisionedThroughput: {
            ReadCapacityUnits: "1",
            WriteCapacityUnits: "1",
          },
        },
      },
      stocks: {
        Type: "AWS::DynamoDB::Table",
        // DeletionPolicy: "Delete",
        Properties: {
          TableName: "${self:provider.environment.STOCKS_TABLE}",
          AttributeDefinitions: [{ AttributeName: "product_id", AttributeType: "S" }],
          KeySchema: [{ AttributeName: "product_id", KeyType: "HASH" }],
          ProvisionedThroughput: {
            ReadCapacityUnits: "1",
            WriteCapacityUnits: "1",
          },
        },
      },
      catalogItemsQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "${self:provider.environment.CATALOG_QUEUE_NAME}"
        }
      },
      createProductTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "${self:provider.environment.SNS_TOPIC}",
          Subscription: [
            {
              Endpoint: "cantacell@hotmail.it",
              Protocol: "email"
            }
          ]
        }
      },
      additionalSNSSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "cantacell@gmail.com",
          Protocol: "email",
          TopicArn: "arn:aws:sns:us-east-1:${aws:accountId}:${self:provider.environment.SNS_TOPIC}",
          FilterPolicy: {
            productPrice: [{ numeric: [">=", 300] }],
          },
        },
      },
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
