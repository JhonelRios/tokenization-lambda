import type { APIGatewayProxyHandler } from 'aws-lambda';

import { TokenService } from '../services/TokenService';

export const handler: APIGatewayProxyHandler = async event => {
  return new TokenService().getCardDetailsByToken(event);
};
