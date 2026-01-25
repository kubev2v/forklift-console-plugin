import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import EmptyCategorySelectOption from 'src/plans/components/EmptyCategorySelectOption';

import Select from '@components/common/Select';
import { SelectGroup, SelectList, SelectOption } from '@patternfly/react-core';
import { getDuplicateValues, isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { StorageMapFieldId, type StorageMapping, type StorageMappingValue } from '../utils/types';

type GroupedSourceStorageFieldProps = {
  fieldId: string;
  storageMappings: StorageMapping[];
  usedSourceStorages: StorageMappingValue[];
  otherSourceStorages: StorageMappingValue[];
};

/**
 * Grouped source storage selector with "used by selected VMs" and "other" categories.
 * Used in plan creation wizard where VM selection determines categorization.
 * For storage map details without VM selection context, use SourceStorageField instead.
 */
const GroupedSourceStorageField: FC<GroupedSourceStorageFieldProps> = ({
  fieldId,
  otherSourceStorages,
  storageMappings,
  usedSourceStorages,
}) => {
  const {
    control,
    formState: { isSubmitting },
    trigger,
  } = useFormContext();
  const { t } = useForkliftTranslation();

  const allStorages = [...usedSourceStorages, ...otherSourceStorages];
  const duplicateNames = getDuplicateValues(allStorages, (storage) => storage.name);

  return (
    <Controller
      name={fieldId}
      control={control}
      render={({ field }) => (
        <Select
          ref={field.ref}
          id={fieldId}
          isDisabled={isSubmitting}
          value={(field.value as StorageMappingValue).name}
          onSelect={(_event, value) => {
            field.onChange(value);
            trigger(StorageMapFieldId.StorageMap).catch(() => undefined);
          }}
          placeholder={t('Select source storage')}
        >
          <SelectGroup label={t('Storages used by the selected VMs')}>
            <SelectList>
              {isEmpty(usedSourceStorages) ? (
                <EmptyCategorySelectOption resourceName="storages" />
              ) : (
                usedSourceStorages.map((usedStorage) => (
                  <SelectOption
                    key={usedStorage.name}
                    value={usedStorage}
                    description={duplicateNames.has(usedStorage.name) ? usedStorage.id : undefined}
                    isDisabled={storageMappings?.some(
                      (mapping: StorageMapping) =>
                        mapping[StorageMapFieldId.SourceStorage].id === usedStorage.id,
                    )}
                  >
                    {usedStorage.name}
                  </SelectOption>
                ))
              )}
            </SelectList>
          </SelectGroup>

          <SelectGroup label={t('Other storages present on the source provider')}>
            <SelectList>
              {isEmpty(otherSourceStorages) ? (
                <EmptyCategorySelectOption resourceName="storages" />
              ) : (
                otherSourceStorages?.map((otherStorage) => (
                  <SelectOption
                    key={otherStorage.name}
                    value={otherStorage}
                    description={
                      duplicateNames.has(otherStorage.name) ? otherStorage.id : undefined
                    }
                    isDisabled={storageMappings.some(
                      (mapping: StorageMapping) =>
                        mapping[StorageMapFieldId.SourceStorage].id === otherStorage.id,
                    )}
                  >
                    {otherStorage.name}
                  </SelectOption>
                ))
              )}
            </SelectList>
          </SelectGroup>
        </Select>
      )}
    />
  );
};

export default GroupedSourceStorageField;
