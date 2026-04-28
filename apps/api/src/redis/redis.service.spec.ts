import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
  }));
});

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('redis://localhost:6379'),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  describe('addToRevocationList', () => {
    it('should store revoked token with TTL', async () => {
      await service.addToRevocationList('token-hash-123', 3600);

      const client = service.getClient();
      expect(client.set).toHaveBeenCalledWith('revoked:token-hash-123', '1', 'EX', 3600);
    });
  });

  describe('isRevoked', () => {
    it('should return false for non-revoked token', async () => {
      const result = await service.isRevoked('token-hash-abc');
      expect(result).toBe(false);
    });

    it('should return true for revoked token', async () => {
      const client = service.getClient();
      (client.get as jest.Mock).mockResolvedValueOnce('1');

      const result = await service.isRevoked('token-hash-revoked');
      expect(result).toBe(true);
    });
  });

  describe('storeRefreshToken', () => {
    it('should store refresh token reference', async () => {
      await service.storeRefreshToken('user-1', 'token-hash', 604800);

      const client = service.getClient();
      expect(client.set).toHaveBeenCalledWith('refresh:user-1:token-hash', '1', 'EX', 604800);
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete refresh token reference', async () => {
      await service.deleteRefreshToken('user-1', 'token-hash');

      const client = service.getClient();
      expect(client.del).toHaveBeenCalledWith('refresh:user-1:token-hash');
    });
  });

  describe('onModuleDestroy', () => {
    it('should close redis connection', async () => {
      await service.onModuleDestroy();

      const client = service.getClient();
      expect(client.quit).toHaveBeenCalled();
    });
  });
});
