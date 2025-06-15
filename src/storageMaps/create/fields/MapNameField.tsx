import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import type { CreateStorageMapFormData } from '../types';

import { CreateStorageMapFieldId, createStorageMapFieldLabels } from './constants';

const MapNameField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
    getFieldState,
  } = useFormContext<CreateStorageMapFormData>();
  const { error } = getFieldState(CreateStorageMapFieldId.MapName);

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={CreateStorageMapFieldId.MapName}
      label={createStorageMapFieldLabels[CreateStorageMapFieldId.MapName]}
    >
      <Controller
        name={CreateStorageMapFieldId.MapName}
        control={control}
        render={({ field }) => (
          <TextInput
            {...field}
            isDisabled={isSubmitting}
            validated={getInputValidated(Boolean(error))}
          />
        )}
        rules={{ required: t('Map name is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default MapNameField;
