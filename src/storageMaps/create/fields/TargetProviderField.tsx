import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { storageMapFieldLabels } from 'src/storageMaps/utils/constants';
import { StorageMapFieldId } from 'src/storageMaps/utils/types';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import ProviderSelect from '@components/ProviderSelect/ProviderSelect';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { CreateStorageMapFormData } from '../types';

const TargetProviderField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
    getFieldState,
  } = useFormContext<CreateStorageMapFormData>();
  const { error } = getFieldState(StorageMapFieldId.TargetProvider);
  const project = useWatch({ control, name: StorageMapFieldId.Project });

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={StorageMapFieldId.TargetProvider}
      label={storageMapFieldLabels[StorageMapFieldId.TargetProvider]}
    >
      <Controller
        name={StorageMapFieldId.TargetProvider}
        control={control}
        render={({ field }) => (
          <ProviderSelect
            isTarget
            ref={field.ref}
            isDisabled={isSubmitting}
            placeholder={t('Select target provider')}
            id={StorageMapFieldId.TargetProvider}
            namespace={project}
            value={field.value?.metadata?.name ?? ''}
            onSelect={(_, value) => {
              field.onChange(value);
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
