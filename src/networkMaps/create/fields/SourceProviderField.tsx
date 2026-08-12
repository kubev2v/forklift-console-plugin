import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import ProviderSelect from '@components/ProviderSelect/ProviderSelect';
import { MenuToggleStatus } from '@patternfly/react-core';
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultNetworkMapping, networkMapFieldLabels } from '../../utils/constants';
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
      fieldId={NetworkMapFieldId.SourceProvider}
      isRequired
      label={networkMapFieldLabels[NetworkMapFieldId.SourceProvider]}
    >
      <Controller
        control={control}
        name={NetworkMapFieldId.SourceProvider}
        render={({ field }) => (
          <ProviderSelect
            id={NetworkMapFieldId.SourceProvider}
            isDisabled={isSubmitting}
            namespace={project}
            onSelect={(_, value) => {
              field.onChange(value);
              setValue(NetworkMapFieldId.NetworkMap, [defaultNetworkMapping]);
            }}
            placeholder={t('Select source provider')}
            ref={field.ref}
            status={error && MenuToggleStatus.danger}
            testId="network-map-source-provider-select"
            value={field.value?.metadata?.name ?? ''}
          />
        )}
        rules={{ required: t('Source provider is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default SourceProviderField;
