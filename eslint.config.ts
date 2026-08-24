import barrelFiles from 'eslint-plugin-barrel-files';
import i18next from 'eslint-plugin-i18next';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier/recommended';
import promise from 'eslint-plugin-promise';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import testingLibrary from 'eslint-plugin-testing-library';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import { dirname, join } from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

import eslintReact from '@eslint-react/eslint-plugin';
import cspellConfigs from '@cspell/eslint-plugin/configs';
import eslint from '@eslint/js';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);
const CSPELL_WORD_LIST = join(dirName, 'cspell.wordlist.txt');
import type { Linter } from 'eslint';

export const createEslintConfig = () =>
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
        'prettier.config.mjs',
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
        'barrel-files': barrelFiles,
        'import/parsers': tseslint.parser,
        perfectionist,
        promise,
        react,
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
        'simple-import-sort': simpleImportSort,
        unicorn,
      },
      rules: {
        '@cspell/spellchecker': [
          'error',
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
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/init-declarations': 'off',
        '@typescript-eslint/max-params': ['error', { max: 5 }],
        '@typescript-eslint/member-ordering': [
          'error',
          {
            classes: ['field', 'constructor', 'private-instance-method', 'public-instance-method'],
          },
        ],
        '@typescript-eslint/naming-convention': [
          'error',
          {
            format: ['camelCase'],
            leadingUnderscore: 'allow',
            selector: 'default',
          },
          {
            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
            modifiers: ['const'],
            selector: 'variable',
          },
          {
            format: ['camelCase', 'PascalCase'],
            leadingUnderscore: 'allow',
            selector: 'variable',
          },
          {
            format: ['camelCase', 'PascalCase'],
            selector: 'function',
          },
          {
            // React components passed as parameters (HOCs / render props)
            format: ['camelCase', 'PascalCase'],
            leadingUnderscore: 'allow',
            selector: 'parameter',
          },
          {
            format: ['PascalCase', 'UPPER_CASE'],
            selector: 'enum',
          },
          {
            format: ['PascalCase', 'UPPER_CASE'],
            selector: 'enumMember',
          },
          {
            format: ['PascalCase'],
            selector: 'typeLike',
          },
          {
            // CRD / API field names (e.g. required_) must stay unrestricted
            format: null,
            selector: 'property',
          },
          {
            // Jest mocks of React components (e.g. ForkliftTrans, ResourceLink)
            format: ['camelCase', 'PascalCase'],
            selector: 'objectLiteralMethod',
          },
          {
            // React component props typed as methods on props types (e.g. FilterType)
            format: ['camelCase', 'PascalCase'],
            selector: 'typeMethod',
          },
          {
            format: null,
            selector: 'import',
          },
        ],
        '@typescript-eslint/no-deprecated': 'error',
        '@typescript-eslint/no-dynamic-delete': 'off',
        '@typescript-eslint/no-explicit-any': 'error',
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
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/non-nullable-type-assertion-style': 'off',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-type-assertion': 'off',
        '@typescript-eslint/no-unused-expressions': [
          'error',
          {
            enforceForJSX: true,
          },
        ],
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
        '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
        'arrow-body-style': 'off',
        'barrel-files/avoid-barrel-files': 'error',
        'barrel-files/avoid-re-export-all': 'error',
        camelcase: ['error', { allow: ['required_'] }],
        'capitalized-comments': 'off',
        complexity: 'off',
        curly: 'error',
        'id-length': ['error', { exceptions: ['t', 'e', 'x', 'y', 'a', 'b', '_', 'i'] }],
        'import/no-named-as-default': 'error',
        'import/no-named-as-default-member': 'off',
        'import/no-unresolved': 'off',
        'import/order': 'off',
        // MTV-6276: align with AGENTS.md file size target
        'max-lines': [
          'error',
          {
            max: 150,
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
                importNames: ['useK8sWatchResource'],
                message:
                  "Import useK8sWatchResource from '@utils/hooks/useK8sWatchResource'. The SDK hook types the error slot as any.",
                name: '@openshift-console/dynamic-plugin-sdk',
              },
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
          'error',
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
        // MTV-6464: TODOs are intentional backlog markers (sonarjs/todo-tag also off)
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
        'perfectionist/sort-jsx-props': [
          'error',
          {
            type: 'alphabetical',
          },
        ],
        'perfectionist/sort-named-imports': 'off',
        'perfectionist/sort-object-types': [
          'error',
          {
            type: 'alphabetical',
          },
        ],
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
        'promise/catch-or-return': ['error', { allowFinally: true }],
        'promise/no-nesting': 'error',
        'promise/no-return-wrap': 'error',
        'promise/param-names': 'error',
        'react-hooks/exhaustive-deps': ['error'],
        'react-refresh/only-export-components': 'error',
        'react/display-name': 'off',
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'simple-import-sort/exports': 'error',
        'simple-import-sort/imports': [
          'error',
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
        'unicorn/no-array-for-each': 'error',
        'unicorn/no-lonely-if': 'error',
        'unicorn/no-useless-spread': 'error',
        'unicorn/prefer-array-some': 'error',
        'unicorn/prefer-includes': 'error',
        'unicorn/throw-new-error': 'error',

        // Rules redundant with TypeScript compiler + IDE
        '@typescript-eslint/no-redeclare': 'off',
        'import/default': 'off',
        'import/named': 'off',
        'import/namespace': 'off',
        'import/no-duplicates': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/strict-void-return': 'off',
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    {
      ...(sonarjs.configs?.recommended as Linter.Config),
      files: ['src/**/*.{js,jsx,ts,tsx}'],
      rules: {
        ...((sonarjs.configs?.recommended as Linter.Config).rules ?? {}),
        // Overlap with max-lines-per-function / intentional complexity
        'sonarjs/cognitive-complexity': 'off',
        'sonarjs/deprecation': 'off',
        // False positives with TypeScript narrowing / branded comparisons
        'sonarjs/different-types-comparison': 'off',
        'sonarjs/fixme-tag': 'off',
        'sonarjs/function-return-type': 'off',
        // Test fixtures, docs URLs, and URL validators use http:// and sample IPs
        'sonarjs/no-clear-text-protocols': 'off',
        // Intentional TODO stubs (e.g. docs URL placeholders)
        'sonarjs/no-commented-code': 'off',
        'sonarjs/no-globals-shadowing': 'off',
        'sonarjs/no-hardcoded-ip': 'off',
        // Form field names / test secrets trip this heuristic
        'sonarjs/no-hardcoded-passwords': 'off',
        // Intentional empty catch with cleanup (parseOrClean pattern)
        'sonarjs/no-ignored-exceptions': 'off',
        'sonarjs/no-unused-vars': 'off',
        'sonarjs/todo-tag': 'off',
        'sonarjs/unused-import': 'off',
      },
    },
    {
      ...eslintReact.configs['recommended-typescript'],
      files: ['src/**/*.{ts,tsx}'],
      rules: {
        ...eslintReact.configs['recommended-typescript'].rules,
        // MTV-6464: promote bug/security-relevant warn rules; turn off noise / React 19-only / class-component legacy
        '@eslint-react/dom/no-dangerously-set-innerhtml': 'error',
        '@eslint-react/dom/no-missing-button-type': 'error',
        '@eslint-react/dom/no-missing-iframe-sandbox': 'error',
        '@eslint-react/dom/no-script-url': 'error',
        '@eslint-react/dom/no-unsafe-iframe-sandbox': 'error',
        '@eslint-react/dom/no-unsafe-target-blank': 'error',
        '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect': 'error',
        '@eslint-react/hooks-extra/no-unnecessary-use-prefix': 'off',
        '@eslint-react/hooks-extra/prefer-use-state-lazy-initialization': 'off',
        '@eslint-react/jsx-key-before-spread': 'error',
        '@eslint-react/naming-convention/context-name': 'error',
        '@eslint-react/no-array-index-key': 'error',
        // Children.* helpers are used intentionally in shared TableCell wrappers
        '@eslint-react/no-children-count': 'off',
        '@eslint-react/no-children-for-each': 'off',
        '@eslint-react/no-children-map': 'off',
        '@eslint-react/no-children-only': 'off',
        '@eslint-react/no-children-to-array': 'off',
        '@eslint-react/no-clone-element': 'error',
        '@eslint-react/no-comment-textnodes': 'error',
        // React 19 API migration (Context.Provider / use / forwardRef) — stay on React 18 patterns
        '@eslint-react/no-context-provider': 'off',
        '@eslint-react/no-duplicate-key': 'error',
        '@eslint-react/no-forward-ref': 'off',
        '@eslint-react/no-implicit-key': 'error',
        '@eslint-react/no-nested-lazy-component-declarations': 'error',
        // No class components in this codebase
        '@eslint-react/no-set-state-in-component-did-mount': 'off',
        '@eslint-react/no-set-state-in-component-did-update': 'off',
        '@eslint-react/no-set-state-in-component-will-update': 'off',
        '@eslint-react/no-unsafe-component-will-mount': 'off',
        '@eslint-react/no-unsafe-component-will-receive-props': 'off',
        '@eslint-react/no-unsafe-component-will-update': 'off',
        '@eslint-react/no-unused-class-component-members': 'off',
        '@eslint-react/no-unused-state': 'off',
        '@eslint-react/no-unstable-context-value': 'error',
        // MTV-6463: stable module-level defaults instead of inline []/{}
        '@eslint-react/no-unstable-default-props': 'error',
        '@eslint-react/no-use-context': 'off',
        '@eslint-react/no-useless-forward-ref': 'off',
        '@eslint-react/web-api/no-leaked-event-listener': 'error',
        '@eslint-react/web-api/no-leaked-interval': 'error',
        '@eslint-react/web-api/no-leaked-resize-observer': 'error',
        '@eslint-react/web-api/no-leaked-timeout': 'error',
      },
    },
    // MTV-6273: enforce explicit return types on src/
    {
      files: ['src/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'error',
      },
    },
    // MTV-6282: disallow untranslated JSX text in src/ (S4 deferred i18next here)
    {
      files: ['src/**/*.{js,jsx,ts,tsx}'],
      plugins: { i18next },
      rules: {
        'i18next/no-literal-string': [
          'error',
          {
            'jsx-components': {
              exclude: ['ForkliftTrans', 'Trans'],
            },
            mode: 'jsx-text-only',
          },
        ],
      },
    },
    // MTV-6464: jsdoc warn rules were IDE noise without CI fail — keep off (docs optional)
    {
      files: ['src/utils/**/*.{js,ts,tsx}'],
      plugins: { jsdoc },
      rules: {
        'jsdoc/require-jsdoc': 'off',
        'jsdoc/require-param': 'off',
        'jsdoc/require-param-name': 'off',
        'jsdoc/require-param-type': 'off',
        'jsdoc/require-property': 'off',
        'jsdoc/require-property-description': 'off',
        'jsdoc/require-property-name': 'off',
        'jsdoc/require-property-type': 'off',
      },
    },
    {
      ...testingLibrary.configs['flat/react'],
      // Unit tests only — do not apply RTL rules to Playwright specs under testing/
      files: ['src/**/__tests__/**/*.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    },
    // Unit-test fixtures often use literal JSX; Playwright stays under testing/**
    {
      files: ['src/**/__tests__/**/*.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
      rules: {
        'i18next/no-literal-string': 'off',
      },
    },
    {
      files: ['src/utils/hooks/useK8sWatchResource.ts'],
      rules: {
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
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
      },
    },
    // Testing directory specific rules (src unit tests inherit max-lines: 150)
    {
      files: [
        'testing/**/*.{js,ts,jsx,tsx}',
        '**/__{tests,mocks}__/**/*.{js,ts,jsx,tsx}',
        'src/**/*.{test,spec}.{ts,tsx}',
      ],
      rules: {
        '@cspell/spellchecker': 'off',
        '@typescript-eslint/class-methods-use-this': 'off',
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/promise-function-async': 'off',
        'jsdoc/require-jsdoc': 'off',
        'jsdoc/require-param': 'off',
        'jsdoc/require-param-name': 'off',
        'jsdoc/require-property': 'off',
        'jsdoc/require-property-description': 'off',
        'jsdoc/require-property-name': 'off',
        'jsdoc/require-property-type': 'off',
        'max-lines-per-function': 'off',
        'no-await-in-loop': 'off',
        'no-console': 'off',
        'no-restricted-imports': 'off',
        'no-warning-comments': 'off',
        'perfectionist/sort-objects': 'off',
        'react-refresh/only-export-components': 'off',
        'require-unicode-regexp': 'off',
        'no-restricted-syntax': 'off',
        '@typescript-eslint/strict-void-return': 'off',
        'sonarjs/cognitive-complexity': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/no-identical-functions': 'off',
      },
    },
    // MTV-6276: Playwright e2e/page-objects stay exempt from max-lines
    {
      files: ['testing/**/*.{js,ts,jsx,tsx}'],
      rules: {
        'max-lines': 'off',
      },
    },
    {
      files: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
      rules: {
        'jsdoc/require-jsdoc': 'off',
        'sonarjs/cognitive-complexity': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/no-identical-functions': 'off',
      },
    },
    prettier,
  ] as Linter.Config[];

export default createEslintConfig();
