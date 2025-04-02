import { ValidatedOptions } from '@patternfly/react-core';

export const getInputValidated = (hasError: boolean) =>
  hasError ? ValidatedOptions.error : ValidatedOptions.default;
