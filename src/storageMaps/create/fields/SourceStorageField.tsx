import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import Select from '@components/common/MtvSelect';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { CreateStorageMapFormData } from '../types';

import { CreateStorageMapFieldId, type StorageMapping } from './constants';
import type { MappingValue } from './types';

type SourceStorageFieldProps = {
  fieldId: string;
  sourceStorages: MappingValue[];
};

const SourceStorageField: FC<SourceStorageFieldProps> = ({ fieldId, sourceStorages }) => {
  const {
    control,
    formState: { isSubmitting },
    trigger,
  } = useFormContext<CreateStorageMapFormData>();
  const { t } = useForkliftTranslation();
  const storageMappings = useWatch({ control, name: CreateStorageMapFieldId.StorageMap });

  return (
    <FormGroupWithErrorText isRequired fieldId={fieldId}>
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <Select
            id={fieldId}
            isDisabled={isSubmitting}
            value={(field.value as MappingValue).name}
            onSelect={async (_event, value) => {
              field.onChange(value);
              await trigger(CreateStorageMapFieldId.StorageMap);
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
                        mapping[CreateStorageMapFieldId.SourceStorage].name === storage.name,
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

export default SourceStorageField;
