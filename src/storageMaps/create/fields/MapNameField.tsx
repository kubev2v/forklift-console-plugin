import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { storageMapFieldLabels } from 'src/storageMaps/utils/constants';
import { StorageMapFieldId } from 'src/storageMaps/utils/types';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';
import { validateMapName } from '@utils/validation/mapNameValidation';

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
          <TextInput {...field} isDisabled={isSubmitting} validated={getInputValidated(error)} />
        )}
        rules={{
          validate: (value) => validateMapName(value, t('Storage map')),
        }}
      />
    </FormGroupWithErrorText>
  );
};

export default MapNameField;
