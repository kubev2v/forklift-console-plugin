import type { JestConfigWithTsJest } from 'ts-jest';

const moduleNameMapper = {
  '@console/*': '<rootDir>/src/__mocks__/dummy.ts',
  '@openshift-console/*': '<rootDir>/src/__mocks__/dummy.ts',
  '\\.(css|less|scss|svg)$': '<rootDir>/src/__mocks__/dummy.ts',
  '^@components/(.*)$': '<rootDir>/src/components/$1',
  'react-i18next': '<rootDir>/src/__mocks__/react-i18next.tsx',
};

// Sync object
export const config: JestConfigWithTsJest = {
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  moduleNameMapper,
  modulePaths: ['<rootDir>'],
  preset: 'ts-jest',
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/src/__mocks__/envvars.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  transform: {
    '^.+\\.[t|j]sx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(@patternfly|@openshift-console\\S*?)/.*)'],
};
export default config;
