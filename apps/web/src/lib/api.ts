const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface AuthUser {
  id: string;
  role: 'parent' | 'teacher' | 'student';
  name: string;
  username?: string;
  grade?: number;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  user: AuthUser;
}

export interface RegisterParentData {
  name: string;
  email: string;
  password: string;
  country: string;
}

export interface RegisterTeacherData {
  name: string;
  email: string;
  password: string;
  schoolName: string;
  country: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = 'An error occurred. Please try again.';
    try {
      const body = await res.json();
      if (body?.message) message = Array.isArray(body.message) ? body.message[0] : body.message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function loginParentTeacher(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function loginStudent(
  username: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login/student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function registerParent(
  data: RegisterParentData,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register/parent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(res);
}

export async function registerTeacher(
  data: RegisterTeacherData,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register/teacher`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(res);
}
