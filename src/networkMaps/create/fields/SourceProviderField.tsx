import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import ProviderSelect from '@components/ProviderSelect/ProviderSelect';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultNetworkMapping, NetworkMapFieldId, networkMapFieldLabels } from '../../constants';
import type { CreateNetworkMapFormData } from '../types';

const SourceProviderField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
    getFieldState,
    setValue,
  } = useFormContext<CreateNetworkMapFormData>();
  const { error } = getFieldState(NetworkMapFieldId.SourceProvider);
  const project = useWatch({ control, name: NetworkMapFieldId.Project });

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={NetworkMapFieldId.SourceProvider}
      label={networkMapFieldLabels[NetworkMapFieldId.SourceProvider]}
    >
      <Controller
        name={NetworkMapFieldId.SourceProvider}
        control={control}
        render={({ field }) => (
          <ProviderSelect
            ref={field.ref}
            isDisabled={isSubmitting}
            placeholder={t('Select source provider')}
            id={NetworkMapFieldId.SourceProvider}
            testId="network-map-source-provider-select"
            namespace={project}
            value={field.value?.metadata?.name ?? ''}
            onSelect={(_, value) => {
              field.onChange(value);
              setValue(NetworkMapFieldId.NetworkMap, [defaultNetworkMapping]);
            }}
            status={error && MenuToggleStatus.danger}
          />
        )}
        rules={{ required: t('Source provider is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default SourceProviderField;
