import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import EmptyCategorySelectOption from 'src/plans/components/EmptyCategorySelectOption';

import Select from '@components/common/MtvSelect';
import { SelectGroup, SelectList, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import type { MappingValue } from '../../types';

import { StorageMapFieldId, type StorageMapping } from './constants';

type SourceStorageFieldProps = {
  fieldId: string;
  usedSourceStorages: MappingValue[];
  otherSourceStorages: MappingValue[];
};

const SourceStorageField: FC<SourceStorageFieldProps> = ({
  fieldId,
  otherSourceStorages,
  usedSourceStorages,
}) => {
  const { control, trigger } = useCreatePlanFormContext();
  const { t } = useForkliftTranslation();
  const storageMappings = useWatch({ control, name: StorageMapFieldId.StorageMap });

  return (
    <Controller
      name={fieldId}
      control={control}
      render={({ field }) => (
        <Select
          id={fieldId}
          value={(field.value as MappingValue).name}
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
                    isDisabled={storageMappings.some(
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

export default SourceStorageField;
