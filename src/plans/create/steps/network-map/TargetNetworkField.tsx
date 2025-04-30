import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import Select from '@components/common/MtvSelect';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks';

type TargetNetworkFieldProps = {
  fieldId: string;
  targetNetworks: Record<string, string>;
};

const TargetNetworkField: FC<TargetNetworkFieldProps> = ({ fieldId, targetNetworks }) => {
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
            value={field.value}
            onSelect={(_event, value) => {
              field.onChange(value);
            }}
            placeholder={t('Select target network')}
          >
            <SelectList>
              {Object.entries(targetNetworks)?.map(([targetNetId, targetNetLabel]) => (
                <SelectOption key={targetNetId} value={targetNetLabel}>
                  {targetNetLabel}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        )}
      />
    </FormGroupWithErrorText>
  );
};

export default TargetNetworkField;
