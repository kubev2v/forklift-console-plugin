import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import ProviderSelect from '@components/ProviderSelect';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultNetworkMapping, NetworkMapFieldId, networkMapFieldLabels } from '../../constants';
import type { CreateNetworkMapFormData } from '../types';

const TargetProviderField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
    getFieldState,
    setValue,
  } = useFormContext<CreateNetworkMapFormData>();
  const { error } = getFieldState(NetworkMapFieldId.TargetProvider);
  const project = useWatch({ control, name: NetworkMapFieldId.Project });

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={NetworkMapFieldId.TargetProvider}
      label={networkMapFieldLabels[NetworkMapFieldId.TargetProvider]}
    >
      <Controller
        name={NetworkMapFieldId.TargetProvider}
        control={control}
        render={({ field }) => (
          <ProviderSelect
            ref={field.ref}
            isDisabled={isSubmitting}
            placeholder={t('Select target provider')}
            id={NetworkMapFieldId.TargetProvider}
            testId="network-map-target-provider-select"
            namespace={project}
            value={field.value?.metadata?.name ?? ''}
            onSelect={(_, value) => {
              field.onChange(value);
              setValue(NetworkMapFieldId.NetworkMap, [defaultNetworkMapping]);
            }}
            status={error && MenuToggleStatus.danger}
          />
        )}
        rules={{ required: t('Target provider is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default TargetProviderField;
