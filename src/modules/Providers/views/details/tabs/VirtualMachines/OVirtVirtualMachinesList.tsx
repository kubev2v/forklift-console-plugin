import React from 'react';
import { EnumToTuple } from 'src/components/common/FilterGroup/helpers';

import type { ResourceFieldFactory } from '@components/common/utils/types';

import { concernFilter, OvirtHostFiler } from './utils/filters';
import { ProviderVirtualMachinesList, type VmData } from './components';
import { OVirtVirtualMachinesCells } from './OVirtVirtualMachinesRow';
import type { ProviderVirtualMachinesProps } from './ProviderVirtualMachines';
import { getVmPowerState } from './utils';

export const oVirtVmFieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    filter: {
      placeholderLabel: t('Filter by name'),
      type: 'freetext',
    },
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    isVisible: true,
    jsonPath: '$.name',
    label: t('Name'),
    resourceFieldId: 'name',
    sortable: true,
  },
  {
    filter: concernFilter(t),
    isVisible: true,
    jsonPath: '$.vm.concerns',
    label: t('Concerns'),
    resourceFieldId: 'concerns',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by cluster'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.cluster',
    label: t('Cluster'),
    resourceFieldId: 'cluster',
    sortable: true,
  },
  {
    filter: OvirtHostFiler(t),
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.host',
    label: t('Host'),
    resourceFieldId: 'host',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by path'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.path',
    label: t('Path'),
    resourceFieldId: 'path',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by status'),
      type: 'enum',
      values: EnumToTuple({ off: 'Off', on: 'On', unknown: 'Unknown' }),
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: (data: VmData) => getVmPowerState(data?.vm),
    label: t('Status'),
    resourceFieldId: 'status',
    sortable: true,
  },
  {
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.description',
    label: t('Description'),
    resourceFieldId: 'description',
    sortable: false,
  },
];

export const OVirtVirtualMachinesList: React.FC<ProviderVirtualMachinesProps> = (props) => (
  <ProviderVirtualMachinesList
    {...props}
    cellMapper={OVirtVirtualMachinesCells}
    fieldsMetadataFactory={oVirtVmFieldsMetadataFactory}
    pageId="OVirtVirtualMachinesList"
  />
);
