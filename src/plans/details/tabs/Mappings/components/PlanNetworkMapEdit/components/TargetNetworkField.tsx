import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { NetworkMappingId } from 'src/networkMaps/utils/getNetworkMapFieldId';
import type { MappingValue } from 'src/plans/create/types';
import { IgnoreNetwork } from 'src/plans/details/tabs/Mappings/utils/constants';

import Select from '@components/common/Select';
import { Divider, SelectList, SelectOption } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { PlanNetworkEditFormValues } from '../utils/types';

type TargetNetworkFieldProps = {
  fieldId: NetworkMappingId;
  targetNetworks: Record<string, MappingValue>;
};

const TargetNetworkField: FC<TargetNetworkFieldProps> = ({ fieldId, targetNetworks }) => {
  const { t } = useForkliftTranslation();
  const { control, trigger } = useFormContext<PlanNetworkEditFormValues>();

  return (
    <Controller
      name={fieldId}
      control={control}
      render={({ field }) => (
        <Select
          ref={field.ref}
          id={fieldId}
          testId={`target-network-${fieldId}`}
          value={(field.value as MappingValue).name}
          onSelect={async (_event, value) => {
            field.onChange(value);
            await trigger(fieldId);
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
