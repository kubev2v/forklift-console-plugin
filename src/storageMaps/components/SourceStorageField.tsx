import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Select from '@components/common/Select';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { getDuplicateValues, isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { StorageMapFieldId, type StorageMapping, type StorageMappingValue } from '../utils/types';

type SourceStorageFieldProps = {
  fieldId: string;
  storageMappings: StorageMapping[];
  sourceStorages: StorageMappingValue[];
};

/**
 * Flat source storage selector without grouping.
 * Used in storage map details page where categorization by VM usage is not applicable.
 */
const SourceStorageField: FC<SourceStorageFieldProps> = ({
  fieldId,
  sourceStorages,
  storageMappings,
}) => {
  const {
    control,
    formState: { isSubmitting },
    trigger,
  } = useFormContext();
  const { t } = useForkliftTranslation();

  const duplicateNames = getDuplicateValues(sourceStorages, (storage) => storage.name);

  return (
    <Controller
      name={fieldId}
      control={control}
      render={({ field }) => (
        <Select
          ref={field.ref}
          id={fieldId}
          testId={`source-storage-${fieldId}`}
          isDisabled={isSubmitting}
          value={(field.value as StorageMappingValue).name}
          onSelect={async (_event, value) => {
            field.onChange(value);
            await trigger();
          }}
          placeholder={t('Select source storage')}
        >
          <SelectList>
            {isEmpty(sourceStorages) ? (
              <SelectOption value="" isDisabled>
                {t('No storages available')}
              </SelectOption>
            ) : (
              sourceStorages.map((storage) => (
                <SelectOption
                  key={storage.name}
                  value={storage}
                  description={duplicateNames.has(storage.name) ? storage.id : undefined}
                  isDisabled={storageMappings?.some(
                    (mapping: StorageMapping) =>
                      mapping[StorageMapFieldId.SourceStorage].id === storage.id,
                  )}
                >
                  {storage.name}
                </SelectOption>
              ))
            )}
          </SelectList>
        </Select>
      )}
    />
  );
};

export default SourceStorageField;
