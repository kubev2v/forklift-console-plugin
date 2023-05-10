import type { Config } from '@jest/types';

// Sync object
export const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  modulePaths: ['<rootDir>'],
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {
    '^.+\\.[t|j]sx?$': 'ts-jest',
    '\\.har$': '<rootDir>/fileTransformer.js',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(@patternfly|@openshift-console\\S*?)/.*)'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
export default config;
