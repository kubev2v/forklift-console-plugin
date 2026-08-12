import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { storageMapFieldLabels } from 'src/storageMaps/utils/constants';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import ProviderSelect from '@components/ProviderSelect/ProviderSelect';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { StorageMapFieldId } from '@utils/storage/types';

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
      fieldId={StorageMapFieldId.TargetProvider}
      isRequired
      label={storageMapFieldLabels[StorageMapFieldId.TargetProvider]}
    >
      <Controller
        control={control}
        name={StorageMapFieldId.TargetProvider}
        render={({ field }) => (
          <ProviderSelect
            id={StorageMapFieldId.TargetProvider}
            isDisabled={isSubmitting}
            isTarget
            namespace={project}
            onSelect={(_, value) => {
              field.onChange(value);
            }}
            placeholder={t('Select target provider')}
            ref={field.ref}
            status={error && MenuToggleStatus.danger}
            testId="target-provider-select"
            value={field.value?.metadata?.name ?? ''}
          />
        )}
        rules={{ required: t('Target provider is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default TargetProviderField;
