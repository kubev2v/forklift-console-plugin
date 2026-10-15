import { type FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Select from '@components/common/Select';
import { Divider, SelectList, SelectOption } from '@patternfly/react-core';
import { POD } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import { IgnoreNetwork } from '@utils/mappings/constants';
import type { MappingValue } from '@utils/types';

const toOptionLabel = (network: MappingValue, defaultNetworkLabel: string): string =>
  network.id === POD || network.name === defaultNetworkLabel ? defaultNetworkLabel : network.name;

const isPodNetworkOption = (network: MappingValue, defaultNetworkLabel: string): boolean =>
  toOptionLabel(network, defaultNetworkLabel) === defaultNetworkLabel;

type TargetNetworkFieldProps = {
  emptyStateMessage?: string;
  fieldId: string;
  hideNonNadTargets?: boolean;
  isDisabled?: boolean;
  showIgnoreNetworkOption?: boolean;
  targetNetworks: MappingValue[] | Record<string, MappingValue>;
  testId?: string;
  triggerFieldId?: string;
};

const TargetNetworkField: FC<TargetNetworkFieldProps> = ({
  emptyStateMessage,
  fieldId,
  hideNonNadTargets,
  isDisabled,
  showIgnoreNetworkOption,
  targetNetworks,
  testId,
  triggerFieldId,
}) => {
  const { control, trigger } = useFormContext();
  const { t } = useForkliftTranslation();
  const defaultNetworkLabel = t('Default network');

  const networksEntries = useMemo(() => {
    const entries = Array.isArray(targetNetworks)
      ? targetNetworks.map((network) => [network.id ?? network.name, network] as const)
      : Object.entries(targetNetworks);

    if (hideNonNadTargets) {
      return entries.filter(
        ([key, network]) =>
          key !== 'podNetwork' && !isPodNetworkOption(network, defaultNetworkLabel),
      );
    }

    return entries;
  }, [defaultNetworkLabel, hideNonNadTargets, targetNetworks]);

  const hasNetworks = useMemo(() => !isEmpty(networksEntries), [networksEntries]);
  const showIgnore = showIgnoreNetworkOption && !hideNonNadTargets;

  const noNadMessage = t(
    'No network attachment definitions (NADs) found in the target namespace. Multi-NIC source networks require at least 2 distinct NADs.',
  );

  return (
    <Controller
      control={control}
      name={fieldId}
      render={({ field }) => {
        const selected = field.value as MappingValue | undefined;
        const selectedLabel = selected ? toOptionLabel(selected, defaultNetworkLabel) : undefined;

        return (
          <Select
            id={fieldId}
            isDisabled={isDisabled}
            onSelect={async (_event, value) => {
              field.onChange(value);
              if (triggerFieldId) {
                await trigger(triggerFieldId);
                return;
              }

              await trigger();
            }}
            placeholder={t('Select target network')}
            ref={field.ref}
            testId={testId ?? `target-network-${fieldId}`}
            value={selectedLabel}
          >
            <SelectList>
              {hasNetworks ? (
                <>
                  {networksEntries.map(([key, network]) => (
                    <SelectOption key={key} value={network}>
                      {toOptionLabel(network, defaultNetworkLabel)}
                    </SelectOption>
                  ))}
                  {showIgnore && (
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
              ) : (
                <SelectOption isDisabled key="empty">
                  {hideNonNadTargets
                    ? noNadMessage
                    : (emptyStateMessage ?? t('No networks available'))}
                </SelectOption>
              )}
            </SelectList>
          </Select>
        );
      }}
    />
  );
};

export default TargetNetworkField;
