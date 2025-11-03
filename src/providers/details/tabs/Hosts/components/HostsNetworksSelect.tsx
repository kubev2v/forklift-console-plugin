import type { Dispatch, FC, SetStateAction } from 'react';
import { calculateCidrNotation } from 'src/modules/Providers/views/details/tabs/Hosts/utils/helpers/calculateCidrNotation';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import type { SelectValueType } from '@components/common/utils/types';
import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import type { NetworkAdapters } from '@kubev2v/types';
import { Content, HelperText, HelperTextItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { getSelectedInventoryHostNetworkTriples } from './utils/getSelectedInventoryHostNetworkTriples';
import type { InventoryHostNetworkTriple } from './utils/types';

type HostsNetworksSelectProps = {
  value: NetworkAdapters;
  onChange: Dispatch<SetStateAction<NetworkAdapters | undefined>>;
  data: InventoryHostNetworkTriple[];
  selectedIds: string[];
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
  const [firstInventoryHostPair] = selectedInventoryHostPairs;
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
    <FormGroupWithHelpText label="Network" isRequired>
      <FilterableSelect
        placeholder={t('Select a network')}
        aria-label={t('Select a network')}
        onSelect={(selected) => {
          onSelect(selected);
        }}
        value={value ? `${value?.name} - ${value?.ipAddress}` : ''}
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
      />
    </FormGroupWithHelpText>
  );
};

export default HostsNetworksSelect;
