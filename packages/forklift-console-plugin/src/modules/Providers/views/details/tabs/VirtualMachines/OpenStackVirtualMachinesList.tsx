import React from 'react';

import { EnumToTuple, ResourceFieldFactory } from '@kubev2v/common';

import { ProviderVirtualMachinesList, VmData } from './components/ProviderVirtualMachinesList';
import { getVmPowerState } from './utils/helpers/getVmPowerState';
import { OpenStackVirtualMachinesRow } from './OpenStackVirtualMachinesRow';
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
    jsonPath: '$.concerns',
    label: t('Concerns'),
    isVisible: true,
    sortable: true,
    filter: {
      type: 'enum',
      primary: true,
      placeholderLabel: t('Concerns'),
      values: EnumToTuple({ Critical: 'Critical', Warning: 'Warning', Information: 'Information' }),
    },
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
    jsonPath: (data) => getVmPowerState('openstack', (data as VmData)?.vm),
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
  obj,
  loaded,
  loadError,
}) => (
  <ProviderVirtualMachinesList
    obj={obj}
    loaded={loaded}
    loadError={loadError}
    rowMapper={OpenStackVirtualMachinesRow}
    fieldsMetadataFactory={openStackVmFieldsMetadataFactory}
    pageId="OpenStackVirtualMachinesList"
  />
);
