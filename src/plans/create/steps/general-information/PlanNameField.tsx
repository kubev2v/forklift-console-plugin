import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { PlanModelGroupVersionKind, type V1beta1Plan } from '@forklift-ui/types';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useTypedK8sWatchResource } from '@utils/hooks/useTypedK8sWatchResource';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';
import { validatePlanName } from './utils';

const PlanNameField: FC = () => {
  const {
    control,
    formState: { errors },
  } = useCreatePlanFormContext();
  const [plans] = useTypedK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    isList: true,
  });

  return (
    <FormGroupWithErrorText
      fieldId={GeneralFormFieldId.PlanName}
      isRequired
      label={generalFormFieldLabels[GeneralFormFieldId.PlanName]}
    >
      <Controller
        control={control}
        name={GeneralFormFieldId.PlanName}
        render={({ field }) => (
          <TextInput
            {...field}
            data-testid="plan-name-input"
            validated={getInputValidated(errors[GeneralFormFieldId.PlanName])}
          />
        )}
        rules={{ validate: (value) => validatePlanName(value, plans) }}
      />
    </FormGroupWithErrorText>
  );
};

export default PlanNameField;
