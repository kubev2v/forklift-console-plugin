import type { ReactNode } from 'react';
import { Controller, type ControllerProps, useFormContext } from 'react-hook-form';
import type { CreatePlanFormValues } from 'src/plans/create/constants';

import { FormErrorHelperText } from '@components/FormErrorHelperText';
import { FormGroup, type FormGroupProps } from '@patternfly/react-core';

type ControlledFormGroupProps<FieldId extends keyof CreatePlanFormValues> = FormGroupProps & {
  fieldId: FieldId;
  controller: Omit<ControllerProps<CreatePlanFormValues, FieldId>, 'name' | 'control'>;
  helperText?: ReactNode;
};

const ControlledFormGroup = <FieldId extends keyof CreatePlanFormValues>({
  children,
  controller,
  fieldId,
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
