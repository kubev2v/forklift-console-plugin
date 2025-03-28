import React, { FC, ReactNode } from 'react';
import { Controller, ControllerProps, useFormContext } from 'react-hook-form';

import { FormErrorHelperText } from '@components/FormErrorHelperText';
import { FormGroup, FormGroupProps } from '@patternfly/react-core';

type ControlledFormGroupProps = FormGroupProps & {
  controller: Omit<ControllerProps, 'name'>;
  helperText?: ReactNode;
};

export const ControlledFormGroup: FC<ControlledFormGroupProps> = ({
  children,
  fieldId,
  controller,
  helperText,
  ...props
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <FormGroup fieldId={fieldId} {...props}>
      <Controller name={fieldId} control={control} {...controller} />
      {children}

      {helperText || <FormErrorHelperText error={errors[fieldId]} />}
    </FormGroup>
  );
};

export default ControlledFormGroup;
