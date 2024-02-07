import React from 'react';

import { EnumToTuple, ResourceFieldFactory } from '@kubev2v/common';

import { concernFilter } from './utils/concernFilter';
import { getVmPowerState } from './utils/helpers/getVmPowerState';
import { ProviderVirtualMachinesList, VmData } from './components';
import { OpenStackVirtualMachinesCells } from './OpenStackVirtualMachinesRow';
import { ProviderVirtualMachinesProps } from './ProviderVirtualMachines';

export const openStackVmFieldsMetadataFactory: ResourceFieldFactory = (t) => [
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
    resourceFieldId: 'hostID',
    jsonPath: '$.vm.hostID',
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
    resourceFieldId: 'tenantID',
    jsonPath: '$.vm.tenantID',
    label: t('Tenant'),
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by tenant'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'imageID',
    jsonPath: '$.vm.imageID',
    label: t('Image'),
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by image'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'flavorID',
    jsonPath: '$.vm.flavorID',
    label: t('Flavor'),
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by flavor'),
    },
    sortable: true,
  },
];

export const OpenStackVirtualMachinesList: React.FC<ProviderVirtualMachinesProps> = ({
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
    cellMapper={OpenStackVirtualMachinesCells}
    fieldsMetadataFactory={openStackVmFieldsMetadataFactory}
    pageId="OpenStackVirtualMachinesList"
    onSelect={onSelect}
    initialSelectedIds={initialSelectedIds}
    className={className}
  />
);
