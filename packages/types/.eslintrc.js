/* eslint-disable no-undef */
const externalConfigPath = '../../config/eslintrc';

module.exports = {
  extends: [externalConfigPath],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/prefer-as-const': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
};
