import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import crypto from 'crypto';

import { RedisRepository } from '../repository/RedisRepository';
import { CardSchema } from '../schemas/CardSchema';

export async function tokenizeFunction(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log({ body: event.body, headers: event.headers });

  if (!event.body) return { statusCode: 400, body: 'No card data' };

  try {
    const cardData = JSON.parse(event.body);

    CardSchema.parse(cardData);

    const token = crypto.randomBytes(8).toString('hex');

    const redisRepository = new RedisRepository();

    try {
      redisRepository.set(token, event.body, { minutesToExpire: 15 });
    } catch (redisError) {
      return { statusCode: 500, body: 'Server error' };
    }

    return { statusCode: 200, body: JSON.stringify({ token }) };
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify(error.errors) };
  }
}
