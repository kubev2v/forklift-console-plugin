import type { JestConfigWithTsJest } from 'ts-jest';

const moduleNameMapper = {
  '@console/*': '<rootDir>/src/__mocks__/dummy.ts',
  '@openshift-console/*': '<rootDir>/src/__mocks__/dummy.ts',
  '\\.(css|less|scss|svg|png|jpg|jpeg|gif|ico)$': '<rootDir>/src/__mocks__/dummy.ts',
  '^@components/(.*)$': '<rootDir>/src/components/$1',
  '^@test-utils/(.*)$': '<rootDir>/src/test-utils/$1',
  '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  'react-i18next': '<rootDir>/src/__mocks__/react-i18next.tsx',
};

// Sync object
export const config: JestConfigWithTsJest = {
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '!src/__mocks__/**',
    '!src/test-utils/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/src/__mocks__/', '/src/test-utils/'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  moduleNameMapper,
  modulePaths: ['<rootDir>'],
  preset: 'ts-jest',
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/src/__mocks__/envvars.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  transform: {
    '^.+\\.[t|j]sx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(@patternfly|@openshift-console\\S*?)/.*)'],
};
export default config;
