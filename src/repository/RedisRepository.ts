import { createClient, type RedisClientType } from 'redis';

export class RedisRepository {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: 'redis-19898.c83.us-east-1-2.ec2.cloud.redislabs.com',
        port: 19898,
      },
    });
    this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    this.client.on('error', error => console.error('Redis Client Error', error));
    await this.client.connect();
  }

  async set(key: string, value: string, options: { minutesToExpire: number }): Promise<void> {
    // EX is the expiration time in seconds
    await this.client.set(key, value, { EX: options.minutesToExpire * 60 });
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }
}
