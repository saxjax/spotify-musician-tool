module.exports = {
  preset: 'jest-preset-angular',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/main.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/*.d.ts'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$)'
  ],
  testTimeout: 5000,
  verbose: true,
  maxWorkers: 1
};
