import type { APIGatewayProxyResult } from 'aws-lambda';

import { ResponseType } from '../types/responses';

export function responseFactory(
  type: ResponseType,
  body: Record<string, any>
): APIGatewayProxyResult {
  const parsedBody = JSON.stringify(body);

  if (type === ResponseType.Ok) return { statusCode: ResponseType.Ok, body: parsedBody };
  if (type === ResponseType.Created) return { statusCode: ResponseType.Created, body: parsedBody };
  if (type === ResponseType.BadRequest)
    return { statusCode: ResponseType.BadRequest, body: parsedBody };
  if (type === ResponseType.Unauthorized)
    return { statusCode: ResponseType.Unauthorized, body: parsedBody };

  return { statusCode: ResponseType.InternalServerError, body: 'Server error' };
}
