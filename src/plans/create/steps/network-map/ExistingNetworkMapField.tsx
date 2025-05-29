import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { netMapFieldLabels, NetworkMapFieldId } from './constants';
import NetworkMapSelect from './NetworkMapSelect';

const ExistingNetworkMapField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState } = useCreatePlanFormContext();
  const { error } = getFieldState(NetworkMapFieldId.ExistingNetworkMap);

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={NetworkMapFieldId.ExistingNetworkMap}
      label={netMapFieldLabels[NetworkMapFieldId.ExistingNetworkMap]}
      className="pf-v5-u-ml-lg"
    >
      <Controller
        name={NetworkMapFieldId.ExistingNetworkMap}
        control={control}
        render={({ field }) => (
          <NetworkMapSelect
            id={NetworkMapFieldId.ExistingNetworkMap}
            value={field.value?.metadata?.name ?? ''}
            status={error && MenuToggleStatus.danger}
            onSelect={(_, value) => {
              field.onChange(value);
            }}
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
