import { hashPassword, verifyPassword } from './password.util';

describe('password.util', () => {
  describe('hashPassword', () => {
    it('should return a salt:hash string', async () => {
      const hash = await hashPassword('TestPassword123');
      const parts = hash.split(':');
      expect(parts).toHaveLength(2);
      expect(parts[0]).toHaveLength(32); // 16 bytes hex = 32 chars
      expect(parts[1]).toHaveLength(128); // 64 bytes hex = 128 chars
    });

    it('should produce different hashes for the same password (unique salts)', async () => {
      const hash1 = await hashPassword('SamePassword');
      const hash2 = await hashPassword('SamePassword');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for matching password', async () => {
      const hash = await hashPassword('CorrectPassword');
      const result = await verifyPassword('CorrectPassword', hash);
      expect(result).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const hash = await hashPassword('CorrectPassword');
      const result = await verifyPassword('WrongPassword', hash);
      expect(result).toBe(false);
    });

    it('should return false for malformed hash', async () => {
      const result = await verifyPassword('anything', 'not-a-valid-hash');
      expect(result).toBe(false);
    });

    it('should return false for empty hash parts', async () => {
      const result = await verifyPassword('anything', ':');
      expect(result).toBe(false);
    });

    it('should handle picture password (joined array)', async () => {
      const picturePassword = ['cat', 'sun', 'tree'].join(':');
      const hash = await hashPassword(picturePassword);
      const result = await verifyPassword(picturePassword, hash);
      expect(result).toBe(true);
    });

    it('should reject wrong picture password order', async () => {
      const hash = await hashPassword(['cat', 'sun', 'tree'].join(':'));
      const result = await verifyPassword(
        ['sun', 'cat', 'tree'].join(':'),
        hash,
      );
      expect(result).toBe(false);
    });
  });
});
