import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import ProviderSelect from '@components/ProviderSelect/ProviderSelect';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultStorageMapping, StorageMapFieldId, storageMapFieldLabels } from '../../constants';
import type { CreateStorageMapFormData } from '../types';

const SourceProviderField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
    getFieldState,
    setValue,
  } = useFormContext<CreateStorageMapFormData>();
  const { error } = getFieldState(StorageMapFieldId.SourceProvider);
  const project = useWatch({ control, name: StorageMapFieldId.Project });

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={StorageMapFieldId.SourceProvider}
      label={storageMapFieldLabels[StorageMapFieldId.SourceProvider]}
    >
      <Controller
        name={StorageMapFieldId.SourceProvider}
        control={control}
        render={({ field }) => (
          <ProviderSelect
            ref={field.ref}
            isDisabled={isSubmitting}
            placeholder={t('Select source provider')}
            id={StorageMapFieldId.SourceProvider}
            namespace={project}
            value={field.value?.metadata?.name ?? ''}
            onSelect={(_, value) => {
              field.onChange(value);
              setValue(StorageMapFieldId.StorageMap, [defaultStorageMapping]);
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
