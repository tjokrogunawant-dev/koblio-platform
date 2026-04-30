const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface AuthUser {
  id: string;
  role: 'parent' | 'teacher' | 'student';
  name: string;
  username?: string;
  grade?: number;
  avatarSlug?: string | null;
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

export async function loginParentTeacher(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'email', email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function loginStudent(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login/student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'student', username, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function registerParent(data: RegisterParentData): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register/parent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(res);
}

export async function registerTeacher(data: RegisterTeacherData): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register/teacher`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(res);
}

export interface RegisterStudentData {
  classCode: string;
  displayName: string;
  username: string;
  password: string;
}

export async function registerStudent(data: RegisterStudentData): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register/student`, {
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
): Promise<ProblemsResponse> {
  const params = new URLSearchParams();
  if (filters.grade !== undefined) params.set('grade', String(filters.grade));
  if (filters.strand) params.set('strand', filters.strand);
  if (filters.topic) params.set('topic', filters.topic);
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters.offset !== undefined) params.set('offset', String(filters.offset));

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/content/problems?${params.toString()}`, { headers });
  return handleResponse<ProblemsResponse>(res);
}

export interface ProblemsResponse {
  data: Problem[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateProblemData {
  grade: number;
  strand: string;
  topic: string;
  difficulty: Difficulty;
  type: ProblemType;
  content: Record<string, unknown>;
}

export type UpdateProblemData = Partial<CreateProblemData>;

export async function createProblem(data: CreateProblemData, token: string): Promise<Problem> {
  const res = await fetch(`${API_BASE}/content/problems`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Problem>(res);
}

export async function updateProblem(
  id: string,
  data: UpdateProblemData,
  token: string,
): Promise<Problem> {
  const res = await fetch(`${API_BASE}/content/problems/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Problem>(res);
}

export async function getProblemsByGrade(grade: number, token?: string): Promise<Problem[]> {
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
  coinsEarned?: number;
  xpEarned?: number;
  leveledUp?: boolean;
}

export async function submitAnswer(
  data: SubmitAnswerData,
  token: string,
): Promise<SubmitAnswerResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/attempts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse<SubmitAnswerResponse>(res);
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export interface StudentGamificationProfile {
  coins: number;
  xp: number;
  level: number;
  streakCount: number;
  levelInfo: {
    level: number;
    xpToNextLevel: number;
    progressPercent: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  displayName: string;
  weeklyCoins: number;
}

export interface LeaderboardResponse {
  rank: number;
  leaderboard: LeaderboardEntry[];
}

export async function getStudentProfile(token: string): Promise<StudentGamificationProfile> {
  const res = await fetch(`${API_BASE}/gamification/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<StudentGamificationProfile>(res);
}

export async function getLeaderboard(
  classroomId: string,
  token: string,
): Promise<LeaderboardResponse> {
  const res = await fetch(`${API_BASE}/gamification/leaderboard/${classroomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<LeaderboardResponse>(res);
}

export async function getDailyChallenge(grade: number): Promise<Problem | null> {
  try {
    const res = await fetch(`${API_BASE}/gamification/daily-challenge/${grade}`);
    if (res.status === 404) return null;
    return handleResponse<Problem>(res);
  } catch {
    return null;
  }
}

// ─── Classrooms ───────────────────────────────────────────────────────────────

export interface Classroom {
  id: string;
  name: string;
  grade: number;
  classCode: string;
  createdAt: string;
}

export interface ClassroomSummary extends Classroom {
  studentCount: number;
}

export interface StudentSummary {
  id: string;
  name: string;
  grade?: number;
  streakCount: number;
  coins: number;
  xp: number;
}

export async function createClassroom(
  data: { name: string; grade: number },
  token: string,
): Promise<Classroom> {
  const res = await fetch(`${API_BASE}/classrooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Classroom>(res);
}

export async function getMyClassrooms(token: string): Promise<ClassroomSummary[]> {
  const res = await fetch(`${API_BASE}/classrooms/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<ClassroomSummary[]>(res);
}

export async function getClassroomStudents(
  classroomId: string,
  token: string,
): Promise<StudentSummary[]> {
  const res = await fetch(`${API_BASE}/classrooms/${classroomId}/students`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<StudentSummary[]>(res);
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export interface CreateAssignmentData {
  classroomId: string;
  title: string;
  topic: string;
  strand: string;
  grade: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  problemIds: string[];
  dueDate?: string;
}

export interface Assignment {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  dueDate?: string;
  classroomId: string;
}

export interface AssignmentSummary extends Assignment {
  submissionCount: number;
  classroomName: string;
}

export interface StudentAssignment {
  assignmentId: string;
  title: string;
  topic: string;
  difficulty: string;
  dueDate?: string;
  classroomName: string;
  problemIds: string[];
}

export interface AssignmentResult {
  correct: number;
  total: number;
  results: { problemId: string; correct: boolean; correctAnswer: string }[];
}

export async function createAssignment(
  data: CreateAssignmentData,
  token: string,
): Promise<Assignment> {
  const res = await fetch(`${API_BASE}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Assignment>(res);
}

export async function getMyAssignments(token: string): Promise<AssignmentSummary[]> {
  const res = await fetch(`${API_BASE}/assignments/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<AssignmentSummary[]>(res);
}

export async function getStudentAssignments(token: string): Promise<StudentAssignment[]> {
  const res = await fetch(`${API_BASE}/assignments/student`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<StudentAssignment[]>(res);
}

export async function submitAssignment(
  assignmentId: string,
  data: { answers: { problemId: string; answer: string }[] },
  token: string,
): Promise<AssignmentResult> {
  const res = await fetch(`${API_BASE}/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<AssignmentResult>(res);
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface StudentProgressRow {
  studentId: string;
  name: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracyPercent: number;
  streakCount: number;
  topicBreakdown: { topic: string; attempted: number; correct: number }[];
}

export interface ClassroomProgress {
  students: StudentProgressRow[];
}

export interface ChildProgress {
  totalAttempts: number;
  correctAttempts: number;
  accuracyPercent: number;
  streakCount: number;
  coins: number;
  xp: number;
  level: number;
  topicBreakdown: { topic: string; attempted: number; correct: number }[];
}

export async function getClassroomProgress(
  classroomId: string,
  token: string,
): Promise<ClassroomProgress> {
  const res = await fetch(`${API_BASE}/classrooms/${classroomId}/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<ClassroomProgress>(res);
}

export async function getChildProgress(childId: string, token: string): Promise<ChildProgress> {
  const res = await fetch(`${API_BASE}/parent/children/${childId}/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<ChildProgress>(res);
}

export interface ChildRef {
  id: string;
  name: string;
  grade?: number;
}

export async function getMyChildren(token: string): Promise<ChildRef[]> {
  const res = await fetch(`${API_BASE}/parent/children`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<ChildRef[]>(res);
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export type BadgeType =
  | 'FIRST_CORRECT'
  | 'PERFECT_10'
  | 'STREAK_7'
  | 'STREAK_30'
  | 'PROBLEMS_100'
  | 'CORRECT_50'
  | 'FRACTION_MASTER'
  | 'SPEED_DEMON'
  | 'MATH_EXPLORER'
  | 'TOP_OF_CLASS';

export interface BadgeDto {
  id: string;
  type: BadgeType;
  awardedAt: string;
  name: string;
  description: string;
  iconEmoji: string;
}

export async function getMyBadges(token: string): Promise<BadgeDto[]> {
  const res = await fetch(`${API_BASE}/badges/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<BadgeDto[]>(res);
}

// ─── Avatar / Profile ─────────────────────────────────────────────────────────

export interface StudentProfile {
  id: string;
  displayName: string;
  grade: number | null;
  avatarSlug: string | null;
  coins: number;
  xp: number;
  level: number;
  streakCount: number;
}

export interface UpdateAvatarResponse {
  id: string;
  displayName: string;
  avatarSlug: string | null;
}

export async function getMyStudentProfile(token: string): Promise<StudentProfile> {
  const res = await fetch(`${API_BASE}/me/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<StudentProfile>(res);
}

export interface UpdateProfileResponse {
  id: string;
  displayName: string;
  avatarSlug: string | null;
}

export async function updateProfile(
  data: { displayName?: string; avatarSlug?: string },
  token: string,
): Promise<UpdateProfileResponse> {
  const res = await fetch(`${API_BASE}/me/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<UpdateProfileResponse>(res);
}

export async function updateAvatar(
  avatarSlug: string,
  token: string,
): Promise<UpdateAvatarResponse> {
  const res = await fetch(`${API_BASE}/me/avatar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ avatarSlug }),
  });
  return handleResponse<UpdateAvatarResponse>(res);
}

// ─── Stripe / Subscriptions ───────────────────────────────────────────────────

export async function createCheckoutSession(token: string): Promise<{ url: string | null }> {
  const res = await fetch(`${API_BASE}/stripe/create-checkout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<{ url: string | null }>(res);
}
