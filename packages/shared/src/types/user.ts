export enum UserRole {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export interface BaseUser {
  id: string;
  role: UserRole;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student extends BaseUser {
  role: UserRole.STUDENT;
  gradeLevel: number;
  parentId: string | null;
  schoolId: string | null;
}

export interface Parent extends BaseUser {
  role: UserRole.PARENT;
  email: string;
  childIds: string[];
}

export interface Teacher extends BaseUser {
  role: UserRole.TEACHER;
  email: string;
  schoolId: string;
  classroomIds: string[];
}
