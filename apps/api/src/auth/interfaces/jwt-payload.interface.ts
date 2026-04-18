import { UserRoleType } from '@koblio/shared';

export interface JwtPayload {
  sub: string;
  email?: string;
  roles: UserRoleType[];
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
}

export interface AuthenticatedUser {
  userId: string;
  email?: string;
  roles: UserRoleType[];
}
