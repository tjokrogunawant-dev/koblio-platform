import { ConfigService } from '@nestjs/config';
import { StudentJwtStrategy } from './student-jwt.strategy';

describe('StudentJwtStrategy', () => {
  let strategy: StudentJwtStrategy;

  beforeEach(() => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-jwt-secret'),
    } as unknown as ConfigService;

    strategy = new StudentJwtStrategy(configService);
  });

  describe('validate', () => {
    it('should extract userId and roles from student JWT payload', () => {
      const payload = {
        sub: 'child_parent1_12345',
        roles: ['student'] as ('student' | 'parent' | 'teacher' | 'admin')[],
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 'child_parent1_12345',
        roles: ['student'],
      });
    });

    it('should return empty roles when not present in payload', () => {
      const payload = {
        sub: 'child_parent1_12345',
      } as { sub: string; roles: ('student' | 'parent' | 'teacher' | 'admin')[] };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 'child_parent1_12345',
        roles: [],
      });
    });
  });
});
