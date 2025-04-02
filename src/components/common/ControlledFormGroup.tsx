import { ReactNode } from 'react';
import { Controller, ControllerProps, useFormContext } from 'react-hook-form';

import { FormErrorHelperText } from '@components/FormErrorHelperText';
import { FormGroup, FormGroupProps } from '@patternfly/react-core';
import { CreatePlanFormValues } from 'src/plans/create/constants';

type ControlledFormGroupProps<FieldId extends keyof CreatePlanFormValues> = FormGroupProps & {
  fieldId: FieldId;
  controller: Omit<ControllerProps<CreatePlanFormValues, FieldId>, 'name' | 'control'>;
  helperText?: ReactNode;
};

export const ControlledFormGroup = <FieldId extends keyof CreatePlanFormValues>({
  children,
  fieldId,
  controller,
  helperText,
  ...props
}: ControlledFormGroupProps<FieldId>) => {
  const { control, getFieldState } = useFormContext<CreatePlanFormValues>();
  const { error } = getFieldState(fieldId);

  return (
    <FormGroup fieldId={fieldId} {...props}>
      <Controller name={fieldId} control={control} {...controller} />
      {children}

      {helperText ?? <FormErrorHelperText error={error} />}
    </FormGroup>
  );
};

export default ControlledFormGroup;
