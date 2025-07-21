import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { StorageMappingValue, TargetStorage } from 'src/storageMaps/types';

import Select from '@components/common/Select';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type TargetStorageFieldProps = {
  fieldId: string;
  targetStorages: TargetStorage[];
};

const TargetStorageField: FC<TargetStorageFieldProps> = ({ fieldId, targetStorages }) => {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();
  const { t } = useForkliftTranslation();

  return (
    <Controller
      name={fieldId}
      control={control}
      render={({ field }) => (
        <Select
          ref={field.ref}
          id={fieldId}
          onSelect={(_, value) => {
            field.onChange(value);
          }}
          placeholder={t('Select target storage')}
          isDisabled={isSubmitting}
          value={(field.value as StorageMappingValue).name}
        >
          <SelectList>
            {targetStorages.map((targetStorage) => (
              <SelectOption key={targetStorage.id} value={targetStorage}>
                {targetStorage.name}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      )}
    />
  );
};

export default TargetStorageField;
