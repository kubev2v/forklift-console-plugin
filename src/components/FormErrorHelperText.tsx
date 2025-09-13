import type { FC } from 'react';
import type { FieldError } from 'react-hook-form';

import { FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';

type FormErrorHelperTextProps = {
  error: FieldError | undefined;
  showIcon?: boolean;
};

export const FormErrorHelperText: FC<FormErrorHelperTextProps> = ({ error, showIcon }) => {
  if (isEmpty(error)) {
    return null;
  }

  return (
    <FormHelperText>
      <HelperText>
        <HelperTextItem
          icon={showIcon ? <ExclamationCircleIcon /> : null}
          variant="error"
          data-testid="form-validation-error"
        >
          {error?.message?.toString()}
        </HelperTextItem>
      </HelperText>
    </FormHelperText>
  );
};
