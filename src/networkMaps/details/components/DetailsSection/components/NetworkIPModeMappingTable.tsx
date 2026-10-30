import type { Dispatch, FC, SetStateAction } from 'react';

import Select from '@components/common/Select';
import type { V1beta1NetworkMapSpecMap } from '@forklift-ui/types';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { IgnoreNetwork, isDefaultNetworkTarget } from '@utils/mappings/constants';

import { NETWORK_IP_MODE_INHERIT } from './constants';

type NetworkIPModeOption = {
  label: string;
  value: string;
};

type NetworkIPModeMappingTableProps = {
  mappings: V1beta1NetworkMapSpecMap[];
  onChange: Dispatch<SetStateAction<V1beta1NetworkMapSpecMap[]>>;
  options: NetworkIPModeOption[];
  translate: (value: string) => string;
};

const getNetworkLabel = (
  mapping: V1beta1NetworkMapSpecMap,
  destination: boolean,
  translate: (value: string) => string,
): string => {
  const network = destination ? mapping.destination : mapping.source;

  if (network.type === 'pod') {
    return translate('Default network');
  }

  if (network.type === 'ignored') {
    return translate(IgnoreNetwork.Label);
  }

  if (destination && network.namespace && network.name) {
    return `${network.namespace}/${network.name}`;
  }

  if ('id' in network) {
    return network.name ?? network.id ?? translate('Unknown');
  }

  return network.name ?? translate('Unknown');
};

const updateMappingMode = (
  mappings: V1beta1NetworkMapSpecMap[],
  index: number,
  selectedValue: string,
): V1beta1NetworkMapSpecMap[] =>
  mappings.map((mapping, currentIndex) => {
    if (currentIndex !== index) {
      return mapping;
    }

    if (selectedValue === NETWORK_IP_MODE_INHERIT) {
      const { networkIPMode: _networkIPMode, ...mappingWithoutMode } = mapping;
      return mappingWithoutMode;
    }

    return {
      ...mapping,
      networkIPMode: selectedValue as V1beta1NetworkMapSpecMap['networkIPMode'],
    };
  });

const NetworkIPModeMappingTable: FC<NetworkIPModeMappingTableProps> = ({
  mappings,
  onChange,
  options,
  translate,
}) => (
  <Table aria-label={translate('Network IP mode mappings')} variant={TableVariant.compact}>
    <Thead>
      <Tr>
        <Th>{translate('Source network')}</Th>
        <Th>{translate('Target network')}</Th>
        <Th>{translate('Network IP mode')}</Th>
      </Tr>
    </Thead>
    <Tbody>
      {mappings.map((mapping, index) => {
        const isEditable =
          !isDefaultNetworkTarget(mapping.destination) && mapping.destination.type !== 'ignored';
        const value = mapping.networkIPMode ?? NETWORK_IP_MODE_INHERIT;
        const key = `${getNetworkLabel(mapping, false, translate)}-${getNetworkLabel(mapping, true, translate)}`;

        return (
          <Tr key={key}>
            <Td dataLabel={translate('Source network')}>
              {getNetworkLabel(mapping, false, translate)}
            </Td>
            <Td dataLabel={translate('Target network')}>
              {getNetworkLabel(mapping, true, translate)}
            </Td>
            <Td dataLabel={translate('Network IP mode')}>
              <Select
                id={`network-ip-mode-${key}`}
                isDisabled={!isEditable}
                onSelect={(_event, selectedValue) => {
                  if (typeof selectedValue === 'string') {
                    onChange((current) => updateMappingMode(current, index, selectedValue));
                  }
                }}
                options={options}
                testId={`network-ip-mode-select-${key}`}
                value={value}
              />
            </Td>
          </Tr>
        );
      })}
    </Tbody>
  </Table>
);

export default NetworkIPModeMappingTable;
