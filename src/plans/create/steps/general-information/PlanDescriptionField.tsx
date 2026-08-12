import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import { FormGroup, TextInput } from '@patternfly/react-core';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';

const PlanDescriptionField: FC = () => {
  const { control } = useCreatePlanFormContext();

  return (
    <FormGroup
      fieldId={GeneralFormFieldId.PlanDescription}
      label={generalFormFieldLabels[GeneralFormFieldId.PlanDescription]}
    >
      <Controller
        control={control}
        name={GeneralFormFieldId.PlanDescription}
        render={({ field }) => <TextInput {...field} data-testid="plan-description-input" />}
      />
    </FormGroup>
  );
};

export default PlanDescriptionField;
