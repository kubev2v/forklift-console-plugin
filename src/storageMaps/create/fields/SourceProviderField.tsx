import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import ProviderSelect from '@components/ProviderSelect';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { CreateStorageMapFormData } from '../types';

import {
  CreateStorageMapFieldId,
  createStorageMapFieldLabels,
  defaultStorageMapping,
} from './constants';

const SourceProviderField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
    getFieldState,
    setValue,
  } = useFormContext<CreateStorageMapFormData>();
  const { error } = getFieldState(CreateStorageMapFieldId.SourceProvider);
  const project = useWatch({ control, name: CreateStorageMapFieldId.Project });

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={CreateStorageMapFieldId.SourceProvider}
      label={createStorageMapFieldLabels[CreateStorageMapFieldId.SourceProvider]}
    >
      <Controller
        name={CreateStorageMapFieldId.SourceProvider}
        control={control}
        render={({ field }) => (
          <ProviderSelect
            isDisabled={isSubmitting}
            placeholder={t('Select source provider')}
            id={CreateStorageMapFieldId.SourceProvider}
            namespace={project}
            value={field.value?.metadata?.name ?? ''}
            onSelect={(_, value) => {
              field.onChange(value);
              setValue(CreateStorageMapFieldId.StorageMap, [defaultStorageMapping]);
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
