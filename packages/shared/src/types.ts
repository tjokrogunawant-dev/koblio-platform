import { UserRoleType } from './constants';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserBase {
  id: string;
  role: UserRoleType;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}
