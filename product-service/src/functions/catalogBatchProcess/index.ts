import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.catalogBatchProcess`,
  events: [
    {
      sqs: "arn:aws:sqs:us-east-1:${aws:accountId}:${self:provider.environment.CATALOG_QUEUE_NAME}"
    },
  ],
};
