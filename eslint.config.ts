import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import importPlugin from 'eslint-plugin-import';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import cspellConfigs from '@cspell/eslint-plugin/configs';
import eslint from '@eslint/js';

import disabledRules from './eslint-rules-disabled';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);
const CSPELL_WORD_LIST = join(dirName, 'cspell.wordlist.txt');
import type { Linter } from 'eslint';

export const createEslintConfig = (ideMode = false) =>
  [
    {
      ignores: [
        '**/dist/**',
        '**/coverage/**',
        '**/node_modules/',
        '**/*.svg',
        '**/.npmrc',
        '**/.yarnrc',
        '**/.yarn/**',
        '**/public/**',
        'yarn.lock',
        'package-lock.json',
        '**/generated/**',
        'eslint.config.ts',
      ],
    },
    eslint.configs.all,
    ...tseslint.configs.all,
    importPlugin.flatConfigs.recommended,
    cspellConfigs.recommended,
    {
      files: ['**/**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
      languageOptions: {
        globals: {
          ...globals.browser,
          process: 'readonly',
        },
        parser: tseslint.parser,
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          ecmaVersion: 'latest',
          project: 'tsconfig.eslint.json',
          sourceType: 'module',
          tsconfigRootDir: import.meta.dirname,
        },
      },
      linterOptions: {
        reportUnusedDisableDirectives: false,
      },
      plugins: {
        '@typescript-eslint': tseslint.plugin,
        'import/parsers': tseslint.parser,
        perfectionist,
        react,
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
        'simple-import-sort': simpleImportSort,
      },
      rules: {
        '@cspell/spellchecker': [
          'warn',
          {
            autoFix: false,
            customWordListFile: CSPELL_WORD_LIST,
          },
        ],
        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { fixStyle: 'inline-type-imports' },
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/member-ordering': [
          'error',
          {
            classes: ['field', 'constructor', 'private-instance-method', 'public-instance-method'],
          },
        ],
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-deprecated': 'off',
        '@typescript-eslint/no-dynamic-delete': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksVoidReturn: {
              arguments: false,
              attributes: false,
              properties: false,
            },
          },
        ],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-type-assertion': 'off',
        '@typescript-eslint/no-unused-expressions': [
          'error',
          {
            enforceForJSX: true,
          },
        ],
        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
        'arrow-body-style': 'off',
        camelcase: ['error', { allow: ['required_'] }],
        'capitalized-comments': 'off',
        complexity: 'off',
        'id-length': ['error', { exceptions: ['t', 'e', 'x', 'y', 'a', 'b', '_', 'i'] }],
        'import/no-named-as-default-member': 'off',
        'import/no-unresolved': 'off',
        'import/order': 'off',
        'max-lines': [
          'error',
          {
            max: 300,
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        'max-lines-per-function': [
          'error',
          {
            IIFEs: true,
            max: 150,
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        'max-statements': 'off',
        'new-cap': [
          'error',
          { capIsNewExceptionPattern: 'Factory$', capIsNewExceptions: ['ImmutableMap'] },
        ],
        'no-alert': 'off',
        'no-console': 'error',
        'no-duplicate-imports': 'off',
        'no-inline-comments': 'off',
        'no-magic-numbers': 'off',
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                importNames: ['default', '*'],
                message:
                  "Do not import React using default or star import. Import specific exports instead (e.g., `import { useState } from 'react'`).",
                name: 'react',
              },
            ],
          },
        ],
        'no-restricted-syntax': [
          'warn',
          {
            message: "Use the custom Select from '@components/common/Select' for consistency.",
            selector:
              'Program:has(ImportDeclaration[source.value="@patternfly/react-core"] ImportSpecifier[imported.name="Select"]) JSXElement[openingElement.name.name="Select"]',
          },
          {
            message:
              "Use 'isEmpty()' or '!isEmpty()' from '@utils/helpers' instead of manual length checks.",
            selector: [
              'BinaryExpression[operator="==="][left.type="MemberExpression"][left.object.type="CallExpression"][left.object.callee.type="MemberExpression"][left.object.callee.object.name="Object"][left.object.callee.property.name="keys"][left.property.name="length"][right.type="Literal"][right.value=0]',
              'BinaryExpression[operator="==="][left.type="MemberExpression"][left.property.name="length"][right.type="Literal"][right.value=0]:not([left.object.type="CallExpression"])',
              'UnaryExpression[operator="!"][argument.type="MemberExpression"][argument.property.name="length"]',
              'BinaryExpression[operator=">"][left.type="MemberExpression"][left.property.name="length"][right.type="Literal"][right.value=0]',
            ].join(','),
          },
          {
            message:
              "Use ButtonVariant enum from '@patternfly/react-core' instead of string literals for button variants.",
            selector:
              'JSXOpeningElement[name.name="Button"] > JSXAttribute[name.name="variant"][value.type="Literal"][value.value=/^(primary|secondary|tertiary|danger|warning|link|plain|control)$/]',
          },
          {
            message: "Use 'testId' instead of 'dataTestId' for consistency across the codebase.",
            selector: [
              'JSXAttribute[name.name="dataTestId"]',
              'TSPropertySignature[key.name="dataTestId"]',
              'Property[key.name="dataTestId"]',
            ].join(','),
          },
        ],
        'no-ternary': 'off',
        'no-undefined': 'off',
        'no-warning-comments': 'off',
        'one-var': 'off',
        'perfectionist/sort-classes': [
          'error',
          {
            groups: [
              'static-property',
              'private-property',
              'property',
              'constructor',
              'static-method',
              'private-method',
              'method',
            ],

            order: 'asc',
            type: 'natural',
          },
        ],
        'perfectionist/sort-imports': 'off',
        'perfectionist/sort-named-imports': 'off',
        'perfectionist/sort-objects': [
          'error',
          {
            type: 'alphabetical',
          },
        ],
        'prefer-arrow-callback': 'off',
        'prettier/prettier': [
          'error',
          {
            endOfLine: 'auto',
          },
        ],
        'react-hooks/exhaustive-deps': ['error'],
        'react-refresh/only-export-components': 'error',
        'react/display-name': 'off',
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'simple-import-sort/exports': 'error',
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
        'sort-imports': 'off',
        'sort-keys': 'off',
        'sort-vars': ['error'],

        // Rules redundant with TypeScript compiler + IDE
        '@typescript-eslint/no-redeclare': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'import/default': 'off',
        'import/named': 'off',
        'import/namespace': 'off',
        'import/no-duplicates': 'off',
        'no-unused-vars': 'off',
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    // TypeaheadSelect component specific rules
    {
      files: ['**/TypeaheadSelect/*.tsx'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
    // Helpers directory specific rules
    {
      files: ['**/utils/helpers.ts'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
    // Telemetry file specific rules
    {
      files: ['**/utils/analytics/**/*.ts'],
      rules: {
        '@cspell/spellchecker': 'off',
        'no-console': 'off',
        'no-underscore-dangle': 'off',
      },
    },
    // Testing directory specific rules
    {
      files: ['testing/**/*.{js,ts,jsx,tsx}', '**/__{tests,mocks}__/**/*.{js,ts,jsx,tsx}'],
      rules: {
        '@cspell/spellchecker': 'off',
        '@typescript-eslint/class-methods-use-this': 'off',
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        'max-lines-per-function': 'off',
        'no-await-in-loop': 'off',
        'no-console': 'off',
        'perfectionist/sort-objects': 'off',
        'react-refresh/only-export-components': 'off',
        'require-unicode-regexp': 'off',
      },
    },
    prettier,
    ...(process.env.HUSKY_LINT_STAGED || ideMode ? [] : [disabledRules]),
  ] as Linter.Config[];

export default createEslintConfig();
