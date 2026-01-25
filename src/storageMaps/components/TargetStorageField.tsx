import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Select from '@components/common/Select';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { StorageMappingValue, TargetStorage } from '../utils/types';

type TargetStorageFieldProps = {
  fieldId: string;
  targetStorages: TargetStorage[];
  testId?: string;
};

const TargetStorageField: FC<TargetStorageFieldProps> = ({ fieldId, targetStorages, testId }) => {
  const {
    control,
    formState: { isSubmitting },
    trigger,
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
          testId={testId}
          onSelect={(_, value) => {
            field.onChange(value);
            trigger().catch(() => undefined);
          }}
          placeholder={t('Select target storage')}
          isDisabled={isSubmitting}
          value={(field.value as StorageMappingValue).name}
        >
          <SelectList>
            {isEmpty(targetStorages) ? (
              <SelectOption key="empty" isDisabled>
                {t('Select a target provider and project to list available target storages')}
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
