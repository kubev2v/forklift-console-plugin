import React, { type FC } from 'react';
import type { FieldError } from 'react-hook-form';

import { FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';

type FormErrorHelperTextProps = {
  error: Partial<FieldError>;
};

export const FormErrorHelperText: FC<FormErrorHelperTextProps> = ({ error }) => {
  if (isEmpty(error)) {
    return null;
  }

  return (
    <FormHelperText>
      <HelperText>
        <HelperTextItem icon={<ExclamationCircleIcon />} variant="error">
          {error?.message?.toString()}
        </HelperTextItem>
      </HelperText>
    </FormHelperText>
  );
};
