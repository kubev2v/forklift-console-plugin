import React from 'react';

import { EnumToTuple, ResourceFieldFactory } from '@kubev2v/common';

import { concernFilter } from './utils/concernFilter';
import { ProviderVirtualMachinesList, VmData } from './components';
import { ProviderVirtualMachinesProps } from './ProviderVirtualMachines';
import { getVmPowerState } from './utils';
import { VSphereVirtualMachinesCells } from './VSphereVirtualMachinesRow';

export const vSphereVmFieldsMetadataFactory: ResourceFieldFactory = (t) => [
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
    resourceFieldId: 'isTemplate',
    jsonPath: '$.vm.isTemplate',
    label: t('Template'),
    isVisible: true,
    isIdentity: false,
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
    resourceFieldId: 'powerState',
    jsonPath: (data: VmData) => getVmPowerState(data?.vm),
    label: t('Power state'),
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'enum',
      placeholderLabel: t('Filter by power state'),
      values: EnumToTuple({ off: 'Off', on: 'On', unknown: 'Unknown' }),
    },
    sortable: true,
  },
];

export const VSphereVirtualMachinesList: React.FC<ProviderVirtualMachinesProps> = ({
  title,
  obj,
  loaded,
  loadError,
  onSelect,
  initialSelectedIds,
}) => (
  <ProviderVirtualMachinesList
    title={title}
    obj={obj}
    loaded={loaded}
    loadError={loadError}
    cellMapper={VSphereVirtualMachinesCells}
    fieldsMetadataFactory={vSphereVmFieldsMetadataFactory}
    pageId="VSphereVirtualMachinesList"
    onSelect={onSelect}
    initialSelectedIds={initialSelectedIds}
  />
);
