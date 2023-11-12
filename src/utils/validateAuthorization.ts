import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import { CommercePkSchema } from '../schemas/CommercePkSchema';
import { PK_TEST } from './constants';

export function validateAuthorization(headers: APIGatewayProxyEventHeaders) {
  const authHeader = headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) throw new Error('Unauthorized');

  try {
    CommercePkSchema.parse(token);
  } catch (error) {
    throw new Error(JSON.stringify(error.errors));
  }

  if (token !== PK_TEST) throw new Error('Wrong token');
}
