import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { hashSync } from 'bcryptjs';
import { AuthService } from './auth.service';
import { Auth0ClientService } from './auth0-client.service';
import { EmailLoginDto, LoginKind, StudentLoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: Record<string, jest.Mock>;
    classroom: Record<string, jest.Mock>;
    $transaction: jest.Mock;
  };
  let redis: Record<string, jest.Mock>;
  let auth0: Record<string, jest.Mock>;
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      classroom: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((fn) => fn(prisma)),
    };

    redis = {
      storeRefreshToken: jest.fn().mockResolvedValue(undefined),
      addToRevocationList: jest.fn().mockResolvedValue(undefined),
      deleteRefreshToken: jest.fn().mockResolvedValue(undefined),
      isRevoked: jest.fn().mockResolvedValue(false),
    };

    auth0 = {
      createUser: jest.fn(),
      authenticateUser: jest.fn(),
      assignRoles: jest.fn().mockResolvedValue(undefined),
      refreshToken: jest.fn(),
      revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('student-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const config: Record<string, string> = {
                AUTH0_ISSUER_URL: 'https://test.auth0.com/',
                AUTH0_AUDIENCE: 'https://api.koblio.com',
                AUTH0_CLIENT_ID: 'test-client-id',
              };
              return config[key];
            }),
            get: jest.fn(),
          },
        },
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
        { provide: Auth0ClientService, useValue: auth0 },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('getStatus', () => {
    it('should return operational status', () => {
      expect(service.getStatus()).toEqual({
        module: 'auth',
        status: 'operational',
      });
    });
  });

  describe('registerParent', () => {
    const dto = {
      email: 'alice@example.com',
      password: 'Str0ngP@ss',
      name: 'Alice Zhang',
      country: 'SG',
      locale: 'en-SG',
    };

    it('should create parent account in Auth0 and Prisma', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      auth0.createUser.mockResolvedValue({ user_id: 'auth0|abc123' });
      prisma.user.create.mockResolvedValue({
        id: 'uuid-1',
        auth0Id: 'auth0|abc123',
        email: dto.email,
        role: 'PARENT',
        displayName: dto.name,
        country: 'SG',
      });
      auth0.authenticateUser.mockResolvedValue({
        access_token: 'at-xyz',
        expires_in: 900,
        refresh_token: 'rt-xyz',
      });

      const result = await service.registerParent(dto);

      expect(auth0.createUser).toHaveBeenCalledWith(
        dto.email,
        dto.password,
        dto.name,
        { role: 'parent' },
      );
      expect(auth0.assignRoles).toHaveBeenCalledWith('auth0|abc123', [
        'parent',
      ]);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          auth0Id: 'auth0|abc123',
          email: dto.email,
          role: 'PARENT',
          displayName: dto.name,
        }),
      });
      expect(result.authResult.access_token).toBe('at-xyz');
      expect(result.authResult.user.role).toBe('parent');
      expect(result.refreshToken).toBe('rt-xyz');
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(service.registerParent(dto)).rejects.toThrow(
        ConflictException,
      );
      expect(auth0.createUser).not.toHaveBeenCalled();
    });

    it('should store refresh token hash in Redis', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      auth0.createUser.mockResolvedValue({ user_id: 'auth0|abc123' });
      prisma.user.create.mockResolvedValue({
        id: 'uuid-1',
        auth0Id: 'auth0|abc123',
        email: dto.email,
        role: 'PARENT',
        displayName: dto.name,
      });
      auth0.authenticateUser.mockResolvedValue({
        access_token: 'at-xyz',
        expires_in: 900,
        refresh_token: 'rt-xyz',
      });

      await service.registerParent(dto);

      expect(redis.storeRefreshToken).toHaveBeenCalledWith(
        'uuid-1',
        expect.any(String),
        7 * 24 * 60 * 60,
      );
    });
  });

  describe('registerTeacher', () => {
    const dto = {
      email: 'teacher@school.edu',
      password: 'T3ach3r!',
      name: 'Jane Smith',
      school_name: 'Springfield Elementary',
      school_country: 'US',
    };

    it('should create teacher account with school in transaction', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      auth0.createUser.mockResolvedValue({ user_id: 'auth0|teacher1' });

      const mockTx = {
        user: {
          create: jest.fn().mockResolvedValue({
            id: 'uuid-t1',
            auth0Id: 'auth0|teacher1',
            email: dto.email,
            role: 'TEACHER',
            displayName: dto.name,
          }),
        },
        school: {
          create: jest.fn().mockResolvedValue({
            id: 'school-1',
            name: dto.school_name,
          }),
        },
        schoolTeacher: {
          create: jest.fn().mockResolvedValue({}),
        },
      };
      prisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

      auth0.authenticateUser.mockResolvedValue({
        access_token: 'at-teacher',
        expires_in: 900,
        refresh_token: 'rt-teacher',
      });

      const result = await service.registerTeacher(dto);

      expect(auth0.createUser).toHaveBeenCalledWith(
        dto.email,
        dto.password,
        dto.name,
        { role: 'teacher', school_name: dto.school_name },
      );
      expect(mockTx.school.create).toHaveBeenCalledWith({
        data: { name: dto.school_name, country: dto.school_country },
      });
      expect(mockTx.schoolTeacher.create).toHaveBeenCalled();
      expect(result.authResult.user.role).toBe('teacher');
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-teacher' });

      await expect(service.registerTeacher(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const dto: EmailLoginDto = {
      kind: LoginKind.EMAIL,
      email: 'alice@example.com',
      password: 'Str0ngP@ss',
    };

    it('should authenticate and return tokens', async () => {
      auth0.authenticateUser.mockResolvedValue({
        access_token: 'at-login',
        expires_in: 900,
        refresh_token: 'rt-login',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'uuid-1',
        email: dto.email,
        role: 'PARENT',
        displayName: 'Alice',
      });

      const result = await service.login(dto);

      expect(auth0.authenticateUser).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
      expect(result.authResult.access_token).toBe('at-login');
      expect(result.authResult.user.id).toBe('uuid-1');
      expect(result.refreshToken).toBe('rt-login');
    });

    it('should throw UnauthorizedException if user not in Prisma', async () => {
      auth0.authenticateUser.mockResolvedValue({
        access_token: 'at-login',
        expires_in: 900,
      });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should propagate Auth0 UnauthorizedException for bad credentials', async () => {
      auth0.authenticateUser.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(service.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('studentLogin', () => {
    const dto: StudentLoginDto = {
      kind: LoginKind.STUDENT,
      username: 'bobbyzhang1234',
      password: 'secret123',
    };

    const passwordHash = hashSync('secret123', 10);

    const mockStudent = {
      id: 'uuid-student-1',
      auth0Id: 'child_parent1_12345',
      email: null,
      role: 'STUDENT',
      displayName: 'Bobby Zhang',
      username: 'bobbyzhang1234',
      passwordHash,
      grade: 2,
      country: 'US',
    };

    it('should authenticate student with username and password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockStudent);

      const result = await service.studentLogin(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'bobbyzhang1234' },
      });
      expect(result.authResult.access_token).toBe('student-jwt-token');
      expect(result.authResult.user.role).toBe('student');
      expect(result.authResult.user.name).toBe('Bobby Zhang');
      expect(result.authResult.user.id).toBe('uuid-student-1');
    });

    it('should sign JWT with student role and auth0Id as sub', async () => {
      prisma.user.findUnique.mockResolvedValue(mockStudent);

      await service.studentLogin(dto);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'child_parent1_12345',
        roles: ['student'],
      });
    });

    it('should throw UnauthorizedException for non-existent username', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.studentLogin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is not a student', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockStudent,
        role: 'TEACHER',
      });

      await expect(service.studentLogin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if no password hash stored', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockStudent,
        passwordHash: null,
      });

      await expect(service.studentLogin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockStudent);

      await expect(
        service.studentLogin({ ...dto, password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should not return email for student accounts (COPPA)', async () => {
      prisma.user.findUnique.mockResolvedValue(mockStudent);

      const result = await service.studentLogin(dto);

      expect(result.authResult.user.email).toBeUndefined();
    });
  });

  describe('classCodeLookup', () => {
    const mockClassroom = {
      id: 'classroom-uuid-1',
      name: 'Grade 2 Math',
      grade: 2,
      classCode: 'SUN-DRAGON-42',
      teacherId: 'teacher-uuid-1',
      schoolId: 'school-uuid-1',
      teacher: { displayName: 'Jane Smith' },
      school: { name: 'Springfield Elementary' },
      _count: { enrollments: 15 },
    };

    it('should resolve class code to classroom info', async () => {
      prisma.classroom.findUnique.mockResolvedValue(mockClassroom);

      const result = await service.classCodeLookup('SUN-DRAGON-42');

      expect(prisma.classroom.findUnique).toHaveBeenCalledWith({
        where: { classCode: 'SUN-DRAGON-42' },
        include: {
          teacher: { select: { displayName: true } },
          school: { select: { name: true } },
          _count: { select: { enrollments: true } },
        },
      });
      expect(result.id).toBe('classroom-uuid-1');
      expect(result.name).toBe('Grade 2 Math');
      expect(result.grade).toBe(2);
      expect(result.class_code).toBe('SUN-DRAGON-42');
      expect(result.teacher_name).toBe('Jane Smith');
      expect(result.school_name).toBe('Springfield Elementary');
      expect(result.student_count).toBe(15);
    });

    it('should handle classroom without school', async () => {
      prisma.classroom.findUnique.mockResolvedValue({
        ...mockClassroom,
        school: null,
        schoolId: null,
      });

      const result = await service.classCodeLookup('SUN-DRAGON-42');

      expect(result.school_name).toBeNull();
    });

    it('should throw NotFoundException for invalid class code', async () => {
      prisma.classroom.findUnique.mockResolvedValue(null);

      await expect(
        service.classCodeLookup('INVALID-CODE-99'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('refresh', () => {
    it('should return new access token from Auth0', async () => {
      redis.isRevoked.mockResolvedValue(false);
      auth0.refreshToken.mockResolvedValue({
        access_token: 'at-new',
        expires_in: 900,
        refresh_token: 'rt-new',
      });

      const result = await service.refresh('rt-old');

      expect(result.access_token).toBe('at-new');
      expect(result.expires_in).toBe(900);
      expect(result.newRefreshToken).toBe('rt-new');
    });

    it('should reject revoked refresh token', async () => {
      redis.isRevoked.mockResolvedValue(true);

      await expect(service.refresh('rt-revoked')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(auth0.refreshToken).not.toHaveBeenCalled();
    });

    it('should add old token to revocation list when rotated', async () => {
      redis.isRevoked.mockResolvedValue(false);
      auth0.refreshToken.mockResolvedValue({
        access_token: 'at-new',
        expires_in: 900,
        refresh_token: 'rt-rotated',
      });

      await service.refresh('rt-old');

      expect(redis.addToRevocationList).toHaveBeenCalledWith(
        expect.any(String),
        7 * 24 * 60 * 60,
      );
    });
  });

  describe('logout', () => {
    it('should revoke refresh token in Redis and Auth0', async () => {
      await service.logout('rt-active');

      expect(redis.addToRevocationList).toHaveBeenCalledWith(
        expect.any(String),
        7 * 24 * 60 * 60,
      );
      expect(auth0.revokeRefreshToken).toHaveBeenCalledWith('rt-active');
    });

    it('should handle missing refresh token gracefully', async () => {
      await service.logout(undefined);

      expect(redis.addToRevocationList).not.toHaveBeenCalled();
      expect(auth0.revokeRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('validateUserRoles', () => {
    it('should return true when user has required role', () => {
      expect(
        service.validateUserRoles(
          { userId: '1', roles: ['teacher'] },
          ['teacher'],
        ),
      ).toBe(true);
    });

    it('should return false when user lacks required role', () => {
      expect(
        service.validateUserRoles(
          { userId: '1', roles: ['student'] },
          ['teacher'],
        ),
      ).toBe(false);
    });
  });

  describe('isStudentAccount', () => {
    it('should return true for student without email', () => {
      expect(
        service.isStudentAccount({ userId: '1', roles: ['student'] }),
      ).toBe(true);
    });

    it('should return false for non-student', () => {
      expect(
        service.isStudentAccount({ userId: '1', roles: ['parent'] }),
      ).toBe(false);
    });
  });

  describe('getAuth0Config', () => {
    it('should return Auth0 configuration', () => {
      const config = service.getAuth0Config();
      expect(config).toEqual({
        domain: 'https://test.auth0.com/',
        audience: 'https://api.koblio.com',
        clientId: 'test-client-id',
      });
    });
  });
});
