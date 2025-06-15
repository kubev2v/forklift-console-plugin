import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { TargetStorage } from 'src/storageMaps/types';

import Select from '@components/common/MtvSelect';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { CreateStorageMapFormData } from '../types';

import type { MappingValue } from './types';

type TargetStorageFieldProps = {
  fieldId: string;
  targetStorages: TargetStorage[];
};

const TargetStorageField: FC<TargetStorageFieldProps> = ({ fieldId, targetStorages }) => {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<CreateStorageMapFormData>();
  const { t } = useForkliftTranslation();

  return (
    <Controller
      name={fieldId}
      control={control}
      render={({ field }) => (
        <Select
          id={fieldId}
          isDisabled={isSubmitting}
          value={(field.value as MappingValue).name}
          onSelect={(_event, value) => {
            field.onChange(value);
          }}
          placeholder={t('Select target storage')}
        >
          <SelectList>
            {isEmpty(targetStorages) ? (
              <SelectOption key="empty" isDisabled>
                {t('Select a target provider to list available target storages')}
              </SelectOption>
            ) : (
              targetStorages.map((targetStorage) => (
                <SelectOption key={targetStorage.id} value={targetStorage}>
                  {targetStorage.name}
                </SelectOption>
              ))
            )}
          </SelectList>
        </Select>
      )}
    />
  );
};

export default TargetStorageField;
