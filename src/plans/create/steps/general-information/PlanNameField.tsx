import { type FC, useCallback } from 'react';
import { Controller } from 'react-hook-form';
import { validateK8sName } from 'src/modules/Providers/utils/validators/common';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { PlanModelGroupVersionKind, type V1beta1Plan } from '@kubev2v/types';
import { useActiveNamespace, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';

const PlanNameField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { errors },
  } = useCreatePlanFormContext();
  const [activeNamespace] = useActiveNamespace();

  const [plans] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    isList: true,
    namespace: activeNamespace,
    namespaced: true,
  });

  const validate = useCallback(
    (value: string) => {
      if (!value) {
        return t('Plan name is required.');
      }

      if (!validateK8sName(value)) {
        return t(
          "Plan name must contain only lowercase alphanumeric characters or '-', and must start or end with lowercase alphanumeric character.",
        );
      }

      if (plans.some((plan) => plan?.metadata?.name === value)) {
        return t('Plan name must be unique within a namespace.');
      }

      return true;
    },
    [plans, t],
  );

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
            validated={getInputValidated(Boolean(errors[GeneralFormFieldId.PlanName]))}
          />
        )}
        rules={{ validate }}
      />
    </FormGroupWithErrorText>
  );
};

export default PlanNameField;
