import { test, expect, request } from '@playwright/test';

test('golden path: teacher → class → student → solve → XP awarded', async () => {
  const ts = Date.now();
  const api = await request.newContext({
    baseURL: process.env.API_URL ?? 'http://localhost:3001',
  });

  // 1. Register teacher
  const regTeacher = await api.post('/auth/register/teacher', {
    data: {
      email: `teacher${ts}@smoke.test`,
      password: 'Smoke123!pass',
      name: 'Smoke Teacher',
      school_name: 'Smoke School',
    },
  });
  expect(regTeacher.status()).toBe(201);

  // 2. Login teacher
  const loginTeacher = await api.post('/auth/login', {
    data: { kind: 'email', email: `teacher${ts}@smoke.test`, password: 'Smoke123!pass' },
  });
  expect(loginTeacher.ok()).toBeTruthy();
  const { access_token: teacherToken } = await loginTeacher.json();

  // 3. Create classroom
  const createClass = await api.post('/classrooms', {
    headers: { Authorization: `Bearer ${teacherToken}` },
    data: { name: 'Math 1A', grade: 1 },
  });
  expect(createClass.status()).toBe(201);
  const { class_code } = await createClass.json();
  expect(typeof class_code).toBe('string');

  // 4. Register student with class code
  const regStudent = await api.post('/auth/register/student', {
    data: {
      classCode: class_code,
      displayName: 'Smokey',
      username: `smokey${ts}`,
      password: 'student123',
    },
  });
  expect(regStudent.status()).toBe(201);

  // 5. Login student
  const loginStudent = await api.post('/auth/login', {
    data: { kind: 'student', username: `smokey${ts}`, password: 'student123' },
  });
  expect(loginStudent.ok()).toBeTruthy();
  const { access_token: studentToken } = await loginStudent.json();

  // 6. Fetch a Grade 1 fill-blank problem (answer is in correctAnswer field)
  const problemsRes = await api.get('/problems?grade=1&type=FILL_BLANK&limit=1');
  expect(problemsRes.ok()).toBeTruthy();
  const { data: problems } = await problemsRes.json();
  expect(problems.length).toBeGreaterThan(0);
  const problem = problems[0];

  // 7. Submit correct answer
  const attemptRes = await api.post('/attempts', {
    headers: { Authorization: `Bearer ${studentToken}` },
    data: { problemId: problem.id, answer: problem.correctAnswer },
  });
  expect(attemptRes.ok()).toBeTruthy();
  const attempt = await attemptRes.json();
  expect(attempt.correct).toBe(true);
  expect(attempt.xpEarned).toBeGreaterThan(0);

  // 8. Verify XP in student stats
  const statsRes = await api.get('/attempts/me/stats', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  expect(statsRes.ok()).toBeTruthy();
  const stats = await statsRes.json();
  expect(stats.totalXp).toBeGreaterThan(0);

  await api.dispose();
});
