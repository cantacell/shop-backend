import { handlerPath } from '@libs/handler-resolver';

export default{
  handler: `${handlerPath(__dirname)}/handler.importProductsFile`,
  events: [
    {
      http: {
        method: 'get',
        path: 'import',
        request: {
          parameters: {
            querystrings: {
              name: true
            }
          },
        },
        cors: true,
        authorizer: {
          arn: "arn:aws:lambda:us-east-1:${aws:accountId}:function:authorization-service-dev-basicAuthorizer",
          type: "request",
          resultTtlInSeconds: 0,
        },
      },
    },
  ],
};
