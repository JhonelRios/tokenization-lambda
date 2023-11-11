import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async event => {
  console.log({ body: event.body, headers: event.headers });
  return {
    statusCode: 200,
    body: 'TEST',
  };
};
