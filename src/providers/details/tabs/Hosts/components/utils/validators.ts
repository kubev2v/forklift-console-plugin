import { validateNoSpaces } from 'src/modules/Providers/utils/validators/common';

export const validateUsername = (username: string) => {
  return validateNoSpaces(username);
};

export const validatePassword = (password: string) => {
  return validateNoSpaces(password);
};
