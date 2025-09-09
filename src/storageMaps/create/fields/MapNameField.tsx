import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';
import { validateMapName } from '@utils/validation/mapNameValidation';

import { StorageMapFieldId, storageMapFieldLabels } from '../../constants';
import type { CreateStorageMapFormData } from '../types';

const MapNameField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
    getFieldState,
  } = useFormContext<CreateStorageMapFormData>();
  const { error } = getFieldState(StorageMapFieldId.MapName);

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={StorageMapFieldId.MapName}
      label={storageMapFieldLabels[StorageMapFieldId.MapName]}
    >
      <Controller
        name={StorageMapFieldId.MapName}
        control={control}
        render={({ field }) => (
          <TextInput
            {...field}
            isDisabled={isSubmitting}
            validated={getInputValidated(Boolean(error))}
          />
        )}
        rules={{
          validate: (value) => validateMapName(value, t('Storage map')),
        }}
      />
    </FormGroupWithErrorText>
  );
};

export default MapNameField;
