module.exports = {
  preset: 'jest-preset-angular',
  testMatch: ['<rootDir>/src/**/?(*.)+(spec).ts'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/main.ts'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$)'
  ]
};
