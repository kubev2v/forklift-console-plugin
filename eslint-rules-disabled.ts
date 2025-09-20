import type { CustomExtends } from 'eslint-define-config';

const disabledRules: CustomExtends = {
  rules: {
    '@typescript-eslint/consistent-return': 'off',
    '@typescript-eslint/init-declarations': 'off',
    '@typescript-eslint/max-params': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-enum-comparison': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/switch-exhaustiveness-check': 'off',
    '@typescript-eslint/unbound-method': 'off',
    'import/no-named-as-default': 'off',
    'max-lines': 'off',
    'max-lines-per-function': 'off',
    'no-console': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react-refresh/only-export-components': 'off',
    'require-atomic-updates': 'off',
  },
};

export default disabledRules;
