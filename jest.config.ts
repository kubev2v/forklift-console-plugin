import { pathsToModuleNameMapper } from 'ts-jest';

import type { Config } from '@jest/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { compilerOptions } = require('./tsconfig');

// Sync object
const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  moduleNameMapper: {
    '\\.(css|less|scss|svg)$': '<rootDir>/src/__mocks__/dummy.ts',
    '@console/*': '<rootDir>/src/__mocks__/dummy.ts',
    'react-i18next': '<rootDir>/src/__mocks__/react-i18next.ts',
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/',
    }),
  },
  modulePaths: ['<rootDir>'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {
    '^.+\\.[t|j]sx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(@patternfly|@openshift-console\\S*?)/.*)'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
export default config;
