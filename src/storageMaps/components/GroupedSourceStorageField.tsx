import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import EmptyCategorySelectOption from 'src/plans/components/EmptyCategorySelectOption';

import Select from '@components/common/Select';
import { SelectGroup, SelectList, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { StorageMapFieldId, type StorageMapping } from '../constants';
import type { StorageMappingValue } from '../types';

type GroupedSourceStorageFieldProps = {
  fieldId: string;
  storageMappings: StorageMapping[];
  usedSourceStorages: StorageMappingValue[];
  otherSourceStorages: StorageMappingValue[];
};

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
          onSelect={async (_event, value) => {
            field.onChange(value);
            await trigger(StorageMapFieldId.StorageMap);
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
                    isDisabled={storageMappings?.some(
                      (mapping: StorageMapping) =>
                        mapping[StorageMapFieldId.SourceStorage].name === usedStorage.name,
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
                    isDisabled={storageMappings.some(
                      (mapping: StorageMapping) =>
                        mapping[StorageMapFieldId.SourceStorage].name === otherStorage.name,
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
