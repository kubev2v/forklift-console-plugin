import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';
import { getMapResourceLabel } from 'src/plans/create/steps/utils';
import {
  StorageMapFieldId,
  type StorageMapping,
  type StorageMappingValue,
} from 'src/storageMaps/utils/types';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import Select from '@components/common/Select';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { getDuplicateValues, isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

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

  const duplicateLabels = getDuplicateValues(sourceStorages, (storage) =>
    getMapResourceLabel(storage),
  );

  return (
    <FormGroupWithErrorText isRequired fieldId={fieldId}>
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
            <SelectList>
              {isEmpty(sourceStorages) ? (
                <SelectOption key="empty" isDisabled>
                  {t('Select a source provider to list available source storages')}
                </SelectOption>
              ) : (
                sourceStorages.map((storage) => {
                  const storageLabel = getMapResourceLabel(storage);
                  const storageValue: StorageMappingValue = {
                    id: storage.id,
                    name: storageLabel,
                  };

                  return (
                    <SelectOption
                      key={storage.id}
                      value={storageValue}
                      description={duplicateLabels.has(storageLabel) ? storage.id : undefined}
                      isDisabled={storageMappings?.some(
                        (mapping: StorageMapping) =>
                          mapping[StorageMapFieldId.SourceStorage].id === storage.id,
                      )}
                    >
                      {storageLabel}
                    </SelectOption>
                  );
                })
              )}
            </SelectList>
          </Select>
        )}
      />
    </FormGroupWithErrorText>
  );
};

export default InventorySourceStorageField;
