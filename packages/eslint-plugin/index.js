/* eslint-disable @cspell/spellchecker */
/* eslint-env node */

const path = require('path');

const CSPELL_WORD_LIST = path.join(__dirname, 'cspell.wordlist.txt');

const base = {
  env: {
    browser: true,
    es2021: true,
  },

  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:react/recommended',
    'plugin:@cspell/recommended',
  ],

  // eslint-disable-next-line prettier/prettier
  plugins: [
    'prettier',
    'react',
    'simple-import-sort',
    'unused-imports',
    '@cspell',
  ],

  rules: {
    'prettier/prettier': ['error'],
    'unused-imports/no-unused-imports': ['error'],
    'simple-import-sort/exports': ['error'],
    'simple-import-sort/imports': [
      'warn',
      {
        groups: [
          [
            '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
          ],
          ['^react', '^\\w'],
          ['^(@|config/)(/*|$)'],
          ['^\\u0000'],
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
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
  },

  settings: {
    react: {
      version: 'detect',
    },
  },

  ignorePatterns: [
    // don't ignore dot files so config files get linted
    '!.*.js',
    '!.*.cjs',
    '!.*.mjs',

    // take the place of `.eslintignore`
    'dist/',
    'generated/',
    'node_modules/',
  ],

  // this is a hack to make sure eslint will look at all of the file extensions we
  // care about without having to put it on the command line
  overrides: [
    {
      files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs', '**/*.ts', '**/*.tsx'],
    },
  ],
};

const typescript = {
  ...base,
  extends: [...base.extends, 'plugin:@typescript-eslint/recommended'],
  plugins: [...base.plugins, '@typescript-eslint'],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2016,
    sourceType: 'module',
  },
};

module.exports = {
  configs: {
    base,
    typescript,
  },
};
