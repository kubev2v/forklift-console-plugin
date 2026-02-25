import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { MenuToggleStatus } from '@patternfly/react-core';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { GeneralFormFieldId } from '../general-information/constants';

import ConfigMapSelect from './ConfigMapSelect';
import { CustomScriptsFieldId, ScriptsFieldLabels } from './constants';

const ExistingConfigMapField: FC = () => {
  const { control, getFieldState } = useCreatePlanFormContext();
  const { error } = getFieldState(CustomScriptsFieldId.ExistingConfigMap);
  const planProject = useWatch({ control, name: GeneralFormFieldId.PlanProject });

  return (
    <FormGroupWithErrorText
      fieldId={CustomScriptsFieldId.ExistingConfigMap}
      label={ScriptsFieldLabels[CustomScriptsFieldId.ExistingConfigMap]}
      className="pf-v6-u-ml-lg"
    >
      <Controller
        name={CustomScriptsFieldId.ExistingConfigMap}
        control={control}
        render={({ field }) => (
          <ConfigMapSelect
            ref={field.ref}
            testId="configmap-select"
            id={CustomScriptsFieldId.ExistingConfigMap}
            value={field.value?.metadata?.name ?? ''}
            status={error && MenuToggleStatus.danger}
            onSelect={(_, value) => {
              field.onChange(value);
            }}
            namespace={planProject}
          />
        )}
      />
    </FormGroupWithErrorText>
  );
};

export default ExistingConfigMapField;
