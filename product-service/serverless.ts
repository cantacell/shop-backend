import type { AWS } from '@serverless/typescript';

import getProductsList from '@functions/getProductsList';
import getProductById from '@functions/getProductById';
import createProduct from '@functions/createProduct';

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
      STOCKS_TABLE: '${env:STOCKS_TABLE}'
    },
    iam: {
      role: {
        statements: [{
          Effect: 'Allow',
          Action: ['dynamodb:Query', 'dynamodb:Scan', 'dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:DeleteItem'],
          Resource: '*'
        }]
      }
    }
  },
  // import the function via paths
  functions: { getProductsList, getProductById, createProduct },
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
