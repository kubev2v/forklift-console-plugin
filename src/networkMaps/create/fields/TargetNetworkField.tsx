import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { NetworkMappingValue } from 'src/networkMaps/types';
import type { TargetNetwork } from 'src/utils/hooks/useTargetNetworks';

import Select from '@components/common/Select';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type TargetNetworkFieldProps = {
  fieldId: string;
  targetNetworks: TargetNetwork[];
};

const TargetNetworkField: FC<TargetNetworkFieldProps> = ({ fieldId, targetNetworks }) => {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();
  const { t } = useForkliftTranslation();

  return (
    <Controller
      name={fieldId}
      control={control}
      render={({ field }) => (
        <Select
          ref={field.ref}
          id={fieldId}
          testId="network-map-target-network-select"
          onSelect={(_, value) => {
            field.onChange(value);
          }}
          placeholder={t('Select target network')}
          isDisabled={isSubmitting}
          value={(field.value as NetworkMappingValue).name}
        >
          <SelectList>
            {isEmpty(targetNetworks) ? (
              <SelectOption key="empty" isDisabled>
                {t('Select a target provider and project to list available target networks')}
              </SelectOption>
            ) : (
              targetNetworks.map((targetNetwork) => (
                <SelectOption key={targetNetwork.id} value={targetNetwork}>
                  {targetNetwork.name}
                </SelectOption>
              ))
            )}
          </SelectList>
        </Select>
      )}
    />
  );
};

export default TargetNetworkField;
