import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import EmptyCategorySelectOption from '@components/common/EmptyCategorySelectOption/EmptyCategorySelectOption';
import Select from '@components/common/Select';
import { SelectGroup, SelectList, SelectOption } from '@patternfly/react-core';
import { getDuplicateValues, isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import { StorageMapFieldId } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

type GroupedSourceStorageFieldProps = {
  fieldId: string;
  otherSourceStorages: MappingValue[];
  usedSourceStorages: MappingValue[];
};

/**
 * Grouped source storage selector with "used by selected VMs" and "other" categories.
 * Used in plan creation wizard where VM selection determines categorization.
 * For storage map details without VM selection context, use SourceStorageField instead.
 */
const GroupedSourceStorageField: FC<GroupedSourceStorageFieldProps> = ({
  fieldId,
  otherSourceStorages,
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
      control={control}
      name={fieldId}
      render={({ field }) => (
        <Select
          id={fieldId}
          isDisabled={isSubmitting}
          onSelect={async (_event, value) => {
            field.onChange(value);
            await trigger(StorageMapFieldId.StorageMap);
          }}
          placeholder={t('Select source storage')}
          ref={field.ref}
          testId={`source-storage-${fieldId}`}
          value={(field.value as MappingValue).name}
        >
          <SelectGroup label={t('Storages used by the selected VMs')}>
            <SelectList>
              {isEmpty(usedSourceStorages) ? (
                <EmptyCategorySelectOption resourceName="storages" />
              ) : (
                usedSourceStorages.map((usedStorage) => (
                  <SelectOption
                    description={duplicateNames.has(usedStorage.name) ? usedStorage.id : undefined}
                    key={usedStorage.name}
                    value={usedStorage}
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
                    description={
                      duplicateNames.has(otherStorage.name) ? otherStorage.id : undefined
                    }
                    key={otherStorage.name}
                    value={otherStorage}
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
