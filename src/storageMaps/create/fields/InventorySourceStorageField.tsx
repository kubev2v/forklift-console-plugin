import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { getMapResourceLabel } from 'src/plans/create/steps/utils';
import type { InventoryStorage } from 'src/utils/hooks/useStorages';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import Select from '@components/common/Select';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { getDuplicateValues, isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import { StorageMapFieldId } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

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

  const duplicateLabels = getDuplicateValues(sourceStorages, (storage) =>
    getMapResourceLabel(storage),
  );

  return (
    <FormGroupWithErrorText fieldId={fieldId} isRequired>
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
            <SelectList>
              {isEmpty(sourceStorages) ? (
                <SelectOption isDisabled key="empty">
                  {t('Select a source provider to list available source storages')}
                </SelectOption>
              ) : (
                sourceStorages.map((storage) => {
                  const storageLabel = getMapResourceLabel(storage);
                  const storageValue: MappingValue = {
                    id: storage.id,
                    name: storageLabel,
                  };

                  return (
                    <SelectOption
                      description={duplicateLabels.has(storageLabel) ? storage.id : undefined}
                      key={storage.id}
                      value={storageValue}
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
