export const APP_NAME = 'Koblio';

export const UserRole = {
  STUDENT: 'student',
  PARENT: 'parent',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];
