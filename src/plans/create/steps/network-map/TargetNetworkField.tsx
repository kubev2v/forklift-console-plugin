import type { FC } from 'react';
import { Controller } from 'react-hook-form';
import { IgnoreNetwork } from 'src/plans/details/tabs/Mappings/utils/constants';

import Select from '@components/common/MtvSelect';
import { Divider, SelectList, SelectOption } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import type { MappingValue } from '../../types';

import { NetworkMapFieldId } from './constants';

type TargetNetworkFieldProps = {
  fieldId: string;
  targetNetworks: Record<string, MappingValue>;
};

const TargetNetworkField: FC<TargetNetworkFieldProps> = ({ fieldId, targetNetworks }) => {
  const { control, trigger } = useCreatePlanFormContext();
  const { t } = useForkliftTranslation();

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
            await trigger(NetworkMapFieldId.NetworkMap);
          }}
          placeholder={t('Select target network')}
        >
          <SelectList>
            {Object.entries(targetNetworks)?.map(([targetNetId, targetNetwork]) => (
              <SelectOption key={targetNetId} value={targetNetwork}>
                {targetNetwork.name}
              </SelectOption>
            ))}
            <Divider />
            <SelectOption
              key={IgnoreNetwork.Type}
              value={{ id: IgnoreNetwork.Type, name: IgnoreNetwork.Label }}
            >
              {IgnoreNetwork.Label}
            </SelectOption>
          </SelectList>
        </Select>
      )}
    />
  );
};

export default TargetNetworkField;
