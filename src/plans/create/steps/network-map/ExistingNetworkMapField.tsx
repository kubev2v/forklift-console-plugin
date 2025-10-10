import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { GeneralFormFieldId } from '../general-information/constants';

import { netMapFieldLabels, NetworkMapFieldId } from './constants';
import NetworkMapSelect from './NetworkMapSelect';

const ExistingNetworkMapField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState } = useCreatePlanFormContext();
  const { error } = getFieldState(NetworkMapFieldId.ExistingNetworkMap);
  const planProject = useWatch({ control, name: GeneralFormFieldId.PlanProject });

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={NetworkMapFieldId.ExistingNetworkMap}
      label={netMapFieldLabels[NetworkMapFieldId.ExistingNetworkMap]}
      className="pf-v6-u-ml-lg"
    >
      <Controller
        name={NetworkMapFieldId.ExistingNetworkMap}
        control={control}
        render={({ field }) => (
          <NetworkMapSelect
            ref={field.ref}
            testId="network-map-select"
            id={NetworkMapFieldId.ExistingNetworkMap}
            value={field.value?.metadata?.name ?? ''}
            status={error && MenuToggleStatus.danger}
            onSelect={(_, value) => {
              field.onChange(value);
            }}
            namespace={planProject}
          />
        )}
        rules={{
          required: t('Network map is required.'),
        }}
      />
    </FormGroupWithErrorText>
  );
};

export default ExistingNetworkMapField;
