import { APIGatewayProxyHandler } from 'aws-lambda';
import { tokenizeFunction } from '../functions/tokenizeFunction';

export const handler: APIGatewayProxyHandler = async event => {
  return tokenizeFunction(event);
};
