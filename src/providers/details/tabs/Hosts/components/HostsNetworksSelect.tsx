import type { Dispatch, FC, SetStateAction } from 'react';
import { calculateCidrNotation } from 'src/providers/details/tabs/Hosts/utils/helpers/calculateCidrNotation';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import type { SelectValueType } from '@components/common/utils/types';
import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import type { NetworkAdapters } from '@forklift-ui/types';
import { Content, HelperText, HelperTextItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { getSelectedInventoryHostNetworkTriples } from './utils/getSelectedInventoryHostNetworkTriples';
import type { InventoryHostNetworkTriple } from './utils/types';

type HostsNetworksSelectProps = {
  data: InventoryHostNetworkTriple[];
  onChange: Dispatch<SetStateAction<NetworkAdapters | undefined>>;
  selectedIds: string[];
  value?: NetworkAdapters;
};

const HostsNetworksSelect: FC<HostsNetworksSelectProps> = ({
  data,
  onChange,
  selectedIds,
  value,
}) => {
  const { t } = useForkliftTranslation();

  const getNetworkAdapterByLabel = (networkAdapters: NetworkAdapters[], label: string) => {
    const selectedAdapter = networkAdapters.find((adapter) => {
      const cidr = calculateCidrNotation(adapter?.ipAddress, adapter?.subnetMask);
      const adapterLabel = `${adapter.name} - ${cidr}`;
      return adapterLabel === label;
    });

    return selectedAdapter;
  };
  const selectedInventoryHostPairs = getSelectedInventoryHostNetworkTriples(data, selectedIds);
  const firstInventoryHostPair: InventoryHostNetworkTriple = selectedInventoryHostPairs?.[0];
  const networkOptions = firstInventoryHostPair?.inventory?.networkAdapters?.map((adapter) => {
    const cidr = calculateCidrNotation(adapter?.ipAddress, adapter?.subnetMask);

    return {
      description: `${adapter.linkSpeed} Mbps, MTU: ${adapter.mtu}`,
      disabled: false,
      key: adapter.name,
      label: `${adapter.name} - ${cidr}`,
    };
  });

  const onSelect = (selected: SelectValueType) => {
    const selectedAdapter = getNetworkAdapterByLabel(
      firstInventoryHostPair?.inventory?.networkAdapters ?? [],
      selected.toString(),
    );

    onChange(selectedAdapter);
  };

  return (
    <FormGroupWithHelpText isRequired label="Network">
      <FilterableSelect
        aria-label={t('Select a network')}
        onSelect={(selected) => {
          onSelect(selected);
        }}
        placeholder={t('Select a network')}
        selectOptions={
          networkOptions?.map((option) => ({
            children: (
              <>
                <Content component="p">{option.label}</Content>
                {option.description && (
                  <HelperText>
                    <HelperTextItem>{option.description}</HelperTextItem>
                  </HelperText>
                )}
              </>
            ),
            isDisabled: option.disabled,
            itemId: option.label,
          })) ?? []
        }
        value={value ? `${value?.name} - ${value?.ipAddress}` : ''}
      />
    </FormGroupWithHelpText>
  );
};

export default HostsNetworksSelect;
