import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { defaultStorageMapping, storageMapFieldLabels } from 'src/storageMaps/utils/constants';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import ProviderSelect from '@components/ProviderSelect/ProviderSelect';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { StorageMapFieldId } from '@utils/storage/types';

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
      fieldId={StorageMapFieldId.SourceProvider}
      isRequired
      label={storageMapFieldLabels[StorageMapFieldId.SourceProvider]}
    >
      <Controller
        control={control}
        name={StorageMapFieldId.SourceProvider}
        render={({ field }) => (
          <ProviderSelect
            id={StorageMapFieldId.SourceProvider}
            isDisabled={isSubmitting}
            namespace={project}
            onSelect={(_, value) => {
              field.onChange(value);
              setValue(StorageMapFieldId.StorageMap, [defaultStorageMapping]);
            }}
            placeholder={t('Select source provider')}
            ref={field.ref}
            status={error && MenuToggleStatus.danger}
            testId="source-provider-select"
            value={field.value?.metadata?.name ?? ''}
          />
        )}
        rules={{ required: t('Source provider is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default SourceProviderField;
