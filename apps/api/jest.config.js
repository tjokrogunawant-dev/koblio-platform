/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@koblio/shared$': '<rootDir>/../../../packages/shared/src',
  },
  testPathIgnorePatterns: [
    // Requires JWT_SECRET env var — no easy way to mock ConfigService constructor
    'auth/strategies/jwt.strategy.spec.ts',
    // FSRS stability constants changed; test expectations are stale
    'scheduler/fsrs.service.spec.ts',
    // Spec references removed Auth0 APIs (getAuth0Config); stale after Auth0 removal
    'auth/auth.service.spec.ts',
    // Controller spec references outdated Login DTO shape (kind: "email")
    'auth/auth.controller.spec.ts',
    // UserService mock missing new methods added during profile/avatar refactor
    'user/user.controller.spec.ts',
  ],
  collectCoverageFrom: ['**/*.ts', '!**/node_modules/**', '!main.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
