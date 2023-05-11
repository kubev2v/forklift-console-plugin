/* eslint-disable @cspell/spellchecker */
import { pathsToModuleNameMapper } from 'ts-jest';

import type { Config } from '@jest/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { compilerOptions } = require('./tsconfig.json');

const moduleNameMapper = {
  '\\.(css|less|scss|svg)$': '<rootDir>/src/__mocks__/dummy.ts',
  '@console/*': '<rootDir>/src/__mocks__/dummy.ts',
  '@openshift-console/*': '<rootDir>/src/__mocks__/dummy.ts',
  'react-i18next': '<rootDir>/src/__mocks__/react-i18next.ts',

  ...pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),

  // Mappings for monorepo packages
  '@kubev2v/legacy/(.*)$': '<rootDir>/../legacy/dist/$1',
  '@kubev2v/common/(.*)$': '<rootDir>/../common/dist/$1',
  '@kubev2v/mocks/(.*)$': '<rootDir>/../mocks/dist/$1',
  '@kubev2v/types/(.*)$': '<rootDir>/../types/dist/$1',
};

// Sync object
export const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  moduleNameMapper,
  modulePaths: ['<rootDir>'],
  roots: ['<rootDir>/src'],
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
  setupFiles: ['<rootDir>/src/__mocks__/envvars.ts'],
};
export default config;
