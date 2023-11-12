import type {
  APIGatewayProxyEvent,
  APIGatewayProxyEventHeaders,
  APIGatewayProxyResult,
} from 'aws-lambda';
import crypto from 'crypto';

import { RedisRepository } from '../repository/RedisRepository';
import { CardSchema } from '../schemas/CardSchema';
import { responseFactory } from '../factory/responseFactory';
import { ResponseType } from '../types/responses';
import { CommercePkSchema } from '../schemas/CommercePkSchema';
import { PK_TEST } from '../utils/constants';

export class TokenService {
  private redisRepository: RedisRepository;

  constructor() {
    this.redisRepository = new RedisRepository();
  }

  private validateAuthorization(headers: APIGatewayProxyEventHeaders) {
    const authHeader = headers['authorization'];
    const pk = authHeader?.split(' ')[1];

    if (!pk) throw new Error('Unauthorized');

    try {
      CommercePkSchema.parse(pk);
    } catch (error) {
      throw new Error(JSON.stringify(error.errors));
    }

    if (pk !== PK_TEST) throw new Error('Wrong token');
  }

  async tokenize(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      this.validateAuthorization(event.headers);
    } catch (error) {
      return responseFactory(ResponseType.Unauthorized, { error: error.message });
    }

    if (!event.body) return responseFactory(ResponseType.BadRequest, { message: 'No card data' });

    try {
      const cardData = JSON.parse(event.body);

      CardSchema.parse(cardData);

      const token = crypto.randomBytes(8).toString('hex');

      try {
        await this.redisRepository.set(token, event.body, { minutesToExpire: 15 });
      } catch (redisError) {
        return responseFactory(ResponseType.InternalServerError, { message: 'Server Error' });
      }

      return responseFactory(ResponseType.Created, { token });
    } catch (error) {
      console.log(error);
      return responseFactory(ResponseType.BadRequest, { error: error.errors });
    }
  }

  async getCardDetailsByToken(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      this.validateAuthorization(event.headers);
    } catch (error) {
      return responseFactory(ResponseType.Unauthorized, { error: error.message });
    }

    const token = event.pathParameters?.token;

    if (!token) return responseFactory(ResponseType.BadRequest, { message: 'No token provided' });

    try {
      const cardDetails = await this.redisRepository.get(token);

      if (!cardDetails)
        return responseFactory(ResponseType.NotFound, { message: 'Card not found' });

      return responseFactory(ResponseType.Ok, { card: JSON.parse(cardDetails) });
    } catch (error) {
      return responseFactory(ResponseType.InternalServerError, { error });
    }
  }
}
