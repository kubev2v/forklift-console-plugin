import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { netMapFieldLabels, NetworkMapFieldId } from '@utils/mappings/networkMap';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { GeneralFormFieldId } from '../general-information/constants';

import NetworkMapSelect from './NetworkMapSelect';

const ExistingNetworkMapField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState } = useCreatePlanFormContext();
  const { error } = getFieldState(NetworkMapFieldId.ExistingNetworkMap);
  const planProject = useWatch({ control, name: GeneralFormFieldId.PlanProject });

  return (
    <FormGroupWithErrorText
      className="pf-v6-u-ml-lg"
      fieldId={NetworkMapFieldId.ExistingNetworkMap}
      isRequired
      label={netMapFieldLabels[NetworkMapFieldId.ExistingNetworkMap]}
    >
      <Controller
        control={control}
        name={NetworkMapFieldId.ExistingNetworkMap}
        render={({ field }) => (
          <NetworkMapSelect
            id={NetworkMapFieldId.ExistingNetworkMap}
            namespace={planProject}
            onSelect={(_, value) => {
              field.onChange(value);
            }}
            ref={field.ref}
            status={error && MenuToggleStatus.danger}
            testId="network-map-select"
            value={field.value?.metadata?.name ?? ''}
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
