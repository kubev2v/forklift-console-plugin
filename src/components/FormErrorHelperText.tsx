import React, { FC } from 'react';
import { FieldError } from 'react-hook-form';

import { FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';

type FormErrorHelperTextProps = {
  error: Partial<FieldError>;
  hasIcon?: boolean;
};

export const FormErrorHelperText: FC<FormErrorHelperTextProps> = ({ error, hasIcon }) => {
  if (isEmpty(error)) {
    return null;
  }

  return (
    <FormHelperText>
      <HelperText>
        <HelperTextItem {...(hasIcon && { icon: <ExclamationCircleIcon /> })} variant="error">
          {error?.message?.toString()}
        </HelperTextItem>
      </HelperText>
    </FormHelperText>
  );
};
