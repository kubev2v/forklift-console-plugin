import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import ProviderSelect from '@components/ProviderSelect';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { CreateStorageMapFormData } from '../types';

import { CreateStorageMapFieldId, createStorageMapFieldLabels } from './constants';

const TargetProviderField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
    getFieldState,
  } = useFormContext<CreateStorageMapFormData>();
  const { error } = getFieldState(CreateStorageMapFieldId.TargetProvider);
  const project = useWatch({ control, name: CreateStorageMapFieldId.Project });

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={CreateStorageMapFieldId.TargetProvider}
      label={createStorageMapFieldLabels[CreateStorageMapFieldId.TargetProvider]}
    >
      <Controller
        name={CreateStorageMapFieldId.TargetProvider}
        control={control}
        render={({ field }) => (
          <ProviderSelect
            isTarget
            isDisabled={isSubmitting}
            placeholder={t('Select target provider')}
            id={CreateStorageMapFieldId.TargetProvider}
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
