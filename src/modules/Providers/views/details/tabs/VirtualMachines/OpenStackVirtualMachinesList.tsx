import React from 'react';
import { EnumToTuple } from 'src/components/common/FilterGroup/helpers';

import type { ResourceFieldFactory } from '@components/common/utils/types';

import { concernFilter } from './utils/filters/concernFilter';
import { getVmPowerState } from './utils/helpers/getVmPowerState';
import { ProviderVirtualMachinesList, type VmData } from './components';
import { OpenStackVirtualMachinesCells } from './OpenStackVirtualMachinesRow';
import type { ProviderVirtualMachinesProps } from './ProviderVirtualMachines';

export const openStackVmFieldsMetadataFactory: ResourceFieldFactory = (t) => [
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
      placeholderLabel: t('Filter by host'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.hostID',
    label: t('Host'),
    resourceFieldId: 'hostID',
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
    filter: {
      placeholderLabel: t('Filter by tenant'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.tenantID',
    label: t('Tenant'),
    resourceFieldId: 'tenantID',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by image'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.imageID',
    label: t('Image'),
    resourceFieldId: 'imageID',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by flavor'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.flavorID',
    label: t('Flavor'),
    resourceFieldId: 'flavorID',
    sortable: true,
  },
];

export const OpenStackVirtualMachinesList: React.FC<ProviderVirtualMachinesProps> = (props) => (
  <ProviderVirtualMachinesList
    {...props}
    cellMapper={OpenStackVirtualMachinesCells}
    fieldsMetadataFactory={openStackVmFieldsMetadataFactory}
    pageId="OpenStackVirtualMachinesList"
  />
);
