import type { FieldError } from 'react-hook-form';

import { ValidatedOptions } from '@patternfly/react-core';

export const getInputValidated = (
  error: boolean | string | FieldError | undefined,
): 'default' | 'error' => (error ? ValidatedOptions.error : ValidatedOptions.default);
