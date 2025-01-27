import React from 'react';

import { ResourceFieldFactory } from '@kubev2v/common';

import { concernFilter } from './utils/filters/concernFilter';
import { ProviderVirtualMachinesList } from './components';
import { OvaVirtualMachinesCells } from './OvaVirtualMachinesRow';
import { ProviderVirtualMachinesProps } from './ProviderVirtualMachines';

export const ovaVmFieldsMetadataFactory: ResourceFieldFactory = (t) => [
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
    resourceFieldId: 'ovaPath',
    jsonPath: '$.vm.OvaPath',
    label: t('OvaPath'),
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by path'),
    },
    sortable: true,
  },
];

export const OvaVirtualMachinesList: React.FC<ProviderVirtualMachinesProps> = (props) => (
  <ProviderVirtualMachinesList
    {...props}
    cellMapper={OvaVirtualMachinesCells}
    fieldsMetadataFactory={ovaVmFieldsMetadataFactory}
    pageId="OvaVirtualMachinesList"
  />
);
