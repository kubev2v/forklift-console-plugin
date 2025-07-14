import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { PlanModelGroupVersionKind, type V1beta1Plan } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';
import { validatePlanName } from './utils';

const PlanNameField: FC = () => {
  const {
    control,
    formState: { errors },
  } = useCreatePlanFormContext();
  const [plans] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    isList: true,
  });

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={GeneralFormFieldId.PlanName}
      label={generalFormFieldLabels[GeneralFormFieldId.PlanName]}
    >
      <Controller
        name={GeneralFormFieldId.PlanName}
        control={control}
        render={({ field }) => (
          <TextInput
            {...field}
            data-testid="plan-name-input"
            validated={getInputValidated(Boolean(errors[GeneralFormFieldId.PlanName]))}
          />
        )}
        rules={{ validate: (value) => validatePlanName(value, plans) }}
      />
    </FormGroupWithErrorText>
  );
};

export default PlanNameField;
