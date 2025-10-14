import type { CustomExtends } from 'eslint-define-config';

const disabledRules: CustomExtends = {
  rules: {
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    'max-lines': 'off',
    'max-lines-per-function': 'off',
    'react-refresh/only-export-components': 'off',
    'require-atomic-updates': 'off',
  },
};

export default disabledRules;
