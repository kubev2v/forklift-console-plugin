/* eslint-env node */

module.exports = {
  root: true,

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2015,
    tsx: true,
    jsx: true,
    js: true,
    useJSXTextNode: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  globals: {
    window: 'readonly',
    describe: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    it: 'readonly',
    process: 'readonly',
    document: 'readonly',
  },
  settings: {
    react: {
      version: '^16.11.0',
    },
  },
  plugins: [
    'prettier',
    '@typescript-eslint',
    'react-hooks',
    'eslint-plugin-react-hooks',
    'testing-library',
  ],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/interface-name-prefix': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'react/prop-types': 'off',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        semi: true,
      },
    ],
    'testing-library/await-async-query': 'error',
    'testing-library/no-await-sync-query': 'error',
    'testing-library/no-debugging-utils': 'warn',
    'testing-library/no-dom-import': 'off',
  },
  env: {
    browser: true,
    node: true,
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
