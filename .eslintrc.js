/* eslint-env node */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

// eslint-disable-next-line @cspell/spellchecker
const CSPELL_WORD_LIST = path.join(__dirname, 'cspell.wordlist.txt');
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2016,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:react/recommended',
    'plugin:@cspell/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    'prettier',
    'react',
    'simple-import-sort',
    'unused-imports',
    '@cspell',
    '@typescript-eslint',
  ],
  rules: {
    'prettier/prettier': ['error'],
    'unused-imports/no-unused-imports': ['error'],
    'simple-import-sort/exports': ['error'],
    'simple-import-sort/imports': [
      'warn',
      {
        groups: [
          ['^react', '^\\w'],
          ['^(@|config/)(/*|$)'],
          ['^\\u0000'],
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ['^.+\\.s?css$'],
        ],
      },
    ],
    '@cspell/spellchecker': [
      'warn',
      {
        customWordListFile: CSPELL_WORD_LIST,
        autoFix: false,
      },
    ],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['dist/', 'distlib/', 'generated/', 'node_modules/', 'storybook-static/'],
};
