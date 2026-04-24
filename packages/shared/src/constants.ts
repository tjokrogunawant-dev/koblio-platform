export const APP_NAME = 'Koblio';

export const UserRole = {
  STUDENT: 'student',
  PARENT: 'parent',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const STUDENT_EMAIL_DOMAIN = 'student.koblio.internal';

export function studentSyntheticEmail(username: string): string {
  return `${username}@${STUDENT_EMAIL_DOMAIN}`;
}
