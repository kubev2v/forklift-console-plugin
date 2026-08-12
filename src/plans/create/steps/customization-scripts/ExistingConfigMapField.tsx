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
      className="pf-v6-u-ml-lg"
      fieldId={CustomScriptsFieldId.ExistingConfigMap}
      label={ScriptsFieldLabels[CustomScriptsFieldId.ExistingConfigMap]}
    >
      <Controller
        control={control}
        name={CustomScriptsFieldId.ExistingConfigMap}
        render={({ field }) => (
          <ConfigMapSelect
            id={CustomScriptsFieldId.ExistingConfigMap}
            namespace={planProject}
            onSelect={(_, value) => {
              field.onChange(value);
            }}
            ref={field.ref}
            status={error && MenuToggleStatus.danger}
            testId="configmap-select"
            value={field.value?.metadata?.name ?? ''}
          />
        )}
      />
    </FormGroupWithErrorText>
  );
};

export default ExistingConfigMapField;
