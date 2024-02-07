import React from 'react';

import { EnumToTuple, ResourceFieldFactory } from '@kubev2v/common';

import { concernFilter } from './utils/concernFilter';
import { ProviderVirtualMachinesList, VmData } from './components';
import { OVirtVirtualMachinesCells } from './OVirtVirtualMachinesRow';
import { ProviderVirtualMachinesProps } from './ProviderVirtualMachines';
import { getVmPowerState } from './utils';

export const oVirtVmFieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    resourceFieldId: 'name',
    jsonPath: '$.name',
    label: t('Name'),
    isVisible: true,
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by name'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'concerns',
    jsonPath: '$.vm.concerns',
    label: t('Concerns'),
    isVisible: true,
    sortable: true,
    filter: concernFilter(t),
  },
  {
    resourceFieldId: 'cluster',
    jsonPath: '$.vm.cluster',
    label: t('Cluster'),
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by cluster'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'host',
    jsonPath: '$.vm.host',
    label: t('Host'),
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by host'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'path',
    jsonPath: '$.vm.path',
    label: t('Path'),
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by path'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'status',
    jsonPath: (data: VmData) => getVmPowerState(data?.vm),
    label: t('Status'),
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'enum',
      placeholderLabel: t('Filter by status'),
      values: EnumToTuple({ off: 'Off', on: 'On', unknown: 'Unknown' }),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'description',
    jsonPath: '$.vm.description',
    label: t('Description'),
    isVisible: true,
    isIdentity: false,
    sortable: false,
  },
];

export const OVirtVirtualMachinesList: React.FC<ProviderVirtualMachinesProps> = ({
  title,
  obj,
  loaded,
  loadError,
  onSelect,
  initialSelectedIds,
  className,
}) => (
  <ProviderVirtualMachinesList
    title={title}
    obj={obj}
    loaded={loaded}
    loadError={loadError}
    cellMapper={OVirtVirtualMachinesCells}
    fieldsMetadataFactory={oVirtVmFieldsMetadataFactory}
    pageId="OVirtVirtualMachinesList"
    onSelect={onSelect}
    initialSelectedIds={initialSelectedIds}
    className={className}
  />
);
