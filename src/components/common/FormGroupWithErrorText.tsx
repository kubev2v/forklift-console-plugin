import type { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormErrorHelperText } from '@components/FormErrorHelperText';
import { FormGroup, type FormGroupProps } from '@patternfly/react-core';

type FormGroupWithErrorTextProps = FormGroupProps & {
  fieldId: string;
  helperText?: ReactNode;
};

const FormGroupWithErrorText = ({
  children,
  fieldId,
  helperText,
  ...props
}: FormGroupWithErrorTextProps) => {
  const { getFieldState } = useFormContext();
  const { error } = getFieldState(fieldId);

  return (
    <FormGroup fieldId={fieldId} {...props}>
      {children}

      {helperText ?? <FormErrorHelperText error={error} />}
    </FormGroup>
  );
};

export default FormGroupWithErrorText;
