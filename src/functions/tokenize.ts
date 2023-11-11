import { APIGatewayProxyHandler } from 'aws-lambda';
import { RedisRepository } from '../repository/RedisRepository';

export const handler: APIGatewayProxyHandler = async event => {
  console.log({ body: event.body, headers: event.headers });
  const redisRepository = new RedisRepository();

  try {
    if (event.body) await redisRepository.set('token', event.body, { minutesToExpire: 15 });
  } catch (error) {
    console.error(error);
  }

  return {
    statusCode: 200,
    body: 'TEST',
  };
};
