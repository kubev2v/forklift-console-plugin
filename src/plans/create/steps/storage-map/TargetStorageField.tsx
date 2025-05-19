import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import Select from '@components/common/MtvSelect';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks';
import type { MappingValue } from '../../types';

import type { TargetStorage } from './constants';

type TargetStorageFieldProps = {
  fieldId: string;
  targetStorages: TargetStorage[];
};

const TargetStorageField: FC<TargetStorageFieldProps> = ({ fieldId, targetStorages }) => {
  const { control } = useCreatePlanFormContext();
  const { t } = useForkliftTranslation();

  return (
    <FormGroupWithErrorText isRequired fieldId={fieldId}>
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <Select
            id={fieldId}
            value={(field.value as MappingValue).name}
            onSelect={(_event, value) => {
              field.onChange(value);
            }}
            placeholder={t('Select target storage')}
          >
            <SelectList>
              {targetStorages.map((targetStorage) => (
                <SelectOption key={targetStorage.id} value={targetStorage.name}>
                  {targetStorage.name}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        )}
      />
    </FormGroupWithErrorText>
  );
};

export default TargetStorageField;
