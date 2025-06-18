import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';
import type { StorageMappingValue } from 'src/storageMaps/types';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import Select from '@components/common/MtvSelect';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { StorageMapFieldId, type StorageMapping } from '../../constants';
import type { CreateStorageMapFormData } from '../types';

type InventorySourceStorageFieldProps = {
  fieldId: string;
  sourceStorages: InventoryStorage[];
};

const InventorySourceStorageField: FC<InventorySourceStorageFieldProps> = ({
  fieldId,
  sourceStorages,
}) => {
  const {
    control,
    formState: { isSubmitting },
    trigger,
  } = useFormContext<CreateStorageMapFormData>();
  const { t } = useForkliftTranslation();
  const storageMappings = useWatch({ control, name: StorageMapFieldId.StorageMap });

  return (
    <FormGroupWithErrorText isRequired fieldId={fieldId}>
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <Select
            id={fieldId}
            isDisabled={isSubmitting}
            value={(field.value as StorageMappingValue).name}
            onSelect={async (_event, value) => {
              field.onChange(value);
              await trigger(StorageMapFieldId.StorageMap);
            }}
            placeholder={t('Select source storage')}
          >
            <SelectList>
              {isEmpty(sourceStorages) ? (
                <SelectOption key="empty" isDisabled>
                  {t('Select a source provider to list available source storages')}
                </SelectOption>
              ) : (
                sourceStorages.map((storage) => (
                  <SelectOption
                    key={storage.name}
                    value={storage}
                    isDisabled={storageMappings?.some(
                      (mapping: StorageMapping) =>
                        mapping[StorageMapFieldId.SourceStorage].name === storage.name,
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
    </FormGroupWithErrorText>
  );
};

export default InventorySourceStorageField;
