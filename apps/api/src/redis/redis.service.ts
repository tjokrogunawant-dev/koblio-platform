import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis(this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'));
    this.client.on('connect', () => this.logger.log('Redis connected'));
    this.client.on('error', (err) => this.logger.error('Redis connection error', err.message));
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async addToRevocationList(tokenId: string, ttlSeconds: number): Promise<void> {
    await this.client.set(`revoked:${tokenId}`, '1', 'EX', ttlSeconds);
  }

  async isRevoked(tokenId: string): Promise<boolean> {
    const result = await this.client.get(`revoked:${tokenId}`);
    return result !== null;
  }

  async storeRefreshToken(userId: string, tokenId: string, ttlSeconds: number): Promise<void> {
    await this.client.set(`refresh:${userId}:${tokenId}`, '1', 'EX', ttlSeconds);
  }

  async deleteRefreshToken(userId: string, tokenId: string): Promise<void> {
    await this.client.del(`refresh:${userId}:${tokenId}`);
  }

  getClient(): Redis {
    return this.client;
  }
}
