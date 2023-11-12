import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import crypto from 'crypto';

import { RedisRepository } from '../repository/RedisRepository';
import { CardSchema } from '../schemas/CardSchema';
import { validateAuthorization } from '../utils/validateAuthorization';
import { responseFactory } from '../factory/ResponseFactory';
import { ResponseType } from '../types/responses';

export async function tokenizeFunction(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    validateAuthorization(event.headers);
  } catch (error) {
    return responseFactory(ResponseType.Unauthorized, { error: error.message });
  }

  if (!event.body) return responseFactory(ResponseType.BadRequest, { message: 'No card data' });

  try {
    const cardData = JSON.parse(event.body);

    CardSchema.parse(cardData);

    const token = crypto.randomBytes(8).toString('hex');

    const redisRepository = new RedisRepository();

    try {
      redisRepository.set(token, event.body, { minutesToExpire: 15 });
    } catch (redisError) {
      return responseFactory(ResponseType.InternalServerError, { message: 'Server Error' });
    }

    return responseFactory(ResponseType.Created, { token });
  } catch (error) {
    return responseFactory(ResponseType.BadRequest, { error: error.errors });
  }
}
