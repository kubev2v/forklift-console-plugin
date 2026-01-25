import { type FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { MappingValue } from 'src/plans/create/types';
import { IgnoreNetwork } from 'src/plans/details/tabs/Mappings/utils/constants';

import Select from '@components/common/Select';
import { Divider, SelectList, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type TargetNetworkFieldProps = {
  fieldId: string;
  targetNetworks: MappingValue[] | Record<string, MappingValue>;
  showIgnoreNetworkOption?: boolean;
  emptyStateMessage?: string;
  isDisabled?: boolean;
  triggerFieldId?: string;
};

const TargetNetworkField: FC<TargetNetworkFieldProps> = ({
  emptyStateMessage,
  fieldId,
  isDisabled,
  showIgnoreNetworkOption,
  targetNetworks,
  triggerFieldId,
}) => {
  const { control, trigger } = useFormContext();
  const { t } = useForkliftTranslation();

  // Normalize targetNetworks to an array of [key, MappingValue] tuples
  const networksEntries = useMemo(
    () =>
      Array.isArray(targetNetworks)
        ? targetNetworks.map((network) => [network.id ?? network.name, network] as const)
        : Object.entries(targetNetworks),
    [targetNetworks],
  );

  const hasNetworks = useMemo(() => !isEmpty(networksEntries), [networksEntries]);

  return (
    <Controller
      name={fieldId}
      control={control}
      render={({ field }) => (
        <Select
          ref={field.ref}
          id={fieldId}
          testId="network-map-target-network-select"
          value={(field.value as MappingValue)?.name}
          onSelect={(_event, value) => {
            field.onChange(value);
            if (triggerFieldId) {
              trigger(triggerFieldId).catch(() => undefined);
              return;
            }

            trigger().catch(() => undefined);
          }}
          placeholder={t('Select target network')}
          isDisabled={isDisabled}
        >
          <SelectList>
            {!hasNetworks && emptyStateMessage ? (
              <SelectOption key="empty" isDisabled>
                {emptyStateMessage}
              </SelectOption>
            ) : (
              <>
                {networksEntries.map(([key, network]) => (
                  <SelectOption key={key} value={network}>
                    {network.name}
                  </SelectOption>
                ))}
                {showIgnoreNetworkOption && (
                  <>
                    <Divider />
                    <SelectOption
                      key={IgnoreNetwork.Type}
                      value={{ id: IgnoreNetwork.Type, name: IgnoreNetwork.Label }}
                    >
                      {IgnoreNetwork.Label}
                    </SelectOption>
                  </>
                )}
              </>
            )}
          </SelectList>
        </Select>
      )}
    />
  );
};

export default TargetNetworkField;
