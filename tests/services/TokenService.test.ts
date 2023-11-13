import type { APIGatewayProxyEvent } from 'aws-lambda';

import { TokenService } from '../../src/services/TokenService';
import { PK_TEST } from '../../src/utils/constants';

const cardDetails = {
  email: 'jhonel@gmail.com',
  card_number: '4111111111111111',
  cvv: '123',
  expiration_year: '2025',
  expiration_month: '09',
};

jest.mock('../../src/repository/RedisRepository', () => {
  return {
    RedisRepository: jest.fn().mockImplementation(() => {
      return {
        set: jest.fn(),
        get: jest.fn().mockResolvedValue(JSON.stringify(cardDetails)),
      };
    }),
  };
});

jest.mock('crypto', () => {
  return {
    randomBytes: jest.fn(() => Buffer.from('culqiInterview', 'utf-8')),
  };
});

describe('TokenService', () => {
  let tokenService: TokenService;
  let mockEvent: APIGatewayProxyEvent;

  beforeEach(() => {
    tokenService = new TokenService();

    mockEvent = {
      headers: { authorization: `Bearer ${PK_TEST}` },
    } as unknown as APIGatewayProxyEvent;
  });

  it('should return a token for the card data', async () => {
    mockEvent.body = JSON.stringify(cardDetails);
    const response = await tokenService.tokenize(mockEvent);

    expect(response).toHaveProperty('statusCode', 201);
    expect(response.body).toContain('token');
  });

  it('should return card details without cvv for a valid token', async () => {
    const mockToken = '0e60caab6fde7ec9';
    mockEvent.pathParameters = { token: mockToken };
    const response = await tokenService.getCardDetailsByToken(mockEvent);

    expect(response).toHaveProperty('statusCode', 200);

    const responseBody = JSON.parse(response.body);

    expect(responseBody).toHaveProperty('card');
    expect(responseBody.card).not.toHaveProperty('cvv');
  });
});
