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
  collectCoverageFrom: ['**/*.ts', '!**/node_modules/**', '!main.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
