import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import Select from '@components/common/MtvSelect';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import type { MappingValue } from '../../types';

type TargetNetworkFieldProps = {
  fieldId: string;
  targetNetworks: Record<string, MappingValue>;
};

const TargetNetworkField: FC<TargetNetworkFieldProps> = ({ fieldId, targetNetworks }) => {
  const { control } = useCreatePlanFormContext();
  const { t } = useForkliftTranslation();

  return (
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
          placeholder={t('Select target network')}
        >
          <SelectList>
            {Object.entries(targetNetworks)?.map(([targetNetId, targetNetwork]) => (
              <SelectOption key={targetNetId} value={targetNetwork}>
                {targetNetwork.name}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      )}
    />
  );
};

export default TargetNetworkField;
