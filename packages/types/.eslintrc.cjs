/* eslint-env node */

module.exports = {
  root: true,
  extends: ['plugin:@kubev2v/eslint-plugin/typescript'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/prefer-as-const': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
};
