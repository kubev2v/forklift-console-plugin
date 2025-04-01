import type { Validation } from 'src/modules/Providers/utils/types/Validation';
import { validateK8sName } from 'src/modules/Providers/utils/validators/common';

import { ValidatedOptions } from '@patternfly/react-core';
import { t } from '@utils/i18n';

export const getInvalidHelperText = (validated: Validation, nameInput: string) => {
  if (validated !== ValidatedOptions.error) return null;

  if (!nameInput) {
    return t('Plan name must not be empty.');
  }
  if (!validateK8sName(nameInput)) {
    return t(
      "Plan name must contain only lowercase alphanumeric characters or '-', and must start or end with lowercase alphanumeric character.",
    );
  }

  return t('Plan name must be unique within a namespace.');
};
