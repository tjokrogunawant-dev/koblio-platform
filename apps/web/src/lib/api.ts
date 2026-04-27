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

// ─── Content / Problems ──────────────────────────────────────────────────────

export type ProblemType = 'MCQ' | 'FILL_BLANK' | 'TRUE_FALSE';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface ProblemOption {
  label: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface Problem {
  id: string;
  grade: number;
  strand: string;
  topic: string;
  type: ProblemType;
  difficulty: Difficulty;
  questionText: string;
  options?: ProblemOption[];
  correctAnswer: string;
  solution: string;
  hints?: string[];
}

export interface ProblemsFilters {
  grade?: number;
  strand?: string;
  topic?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
}

export async function getProblems(
  filters: ProblemsFilters,
  token?: string,
): Promise<Problem[]> {
  const params = new URLSearchParams();
  if (filters.grade !== undefined) params.set('grade', String(filters.grade));
  if (filters.strand) params.set('strand', filters.strand);
  if (filters.topic) params.set('topic', filters.topic);
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters.offset !== undefined) params.set('offset', String(filters.offset));

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(
    `${API_BASE}/content/problems?${params.toString()}`,
    { headers },
  );
  return handleResponse<Problem[]>(res);
}

export async function getProblemsByGrade(
  grade: number,
  token?: string,
): Promise<Problem[]> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/content/problems/grade/${grade}`, {
    headers,
  });
  return handleResponse<Problem[]>(res);
}

export async function getProblem(id: string, token?: string): Promise<Problem> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/content/problems/${id}`, { headers });
  return handleResponse<Problem>(res);
}

// ─── Attempts ────────────────────────────────────────────────────────────────

export interface SubmitAnswerData {
  problemId: string;
  answer: string;
  timeSpentMs: number;
  hintUsed: boolean;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  correctAnswer: string;
  solution: string;
  attemptId: string;
}

export async function submitAnswer(
  data: SubmitAnswerData,
  token: string,
): Promise<SubmitAnswerResponse> {
  const res = await fetch(`${API_BASE}/attempts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<SubmitAnswerResponse>(res);
}
