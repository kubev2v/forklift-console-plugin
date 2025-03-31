import React from 'react';

import type { ResourceFieldFactory } from '@components/common/utils/types';

import { concernFilter } from './utils/filters/concernFilter';
import { ProviderVirtualMachinesList } from './components';
import { OvaVirtualMachinesCells } from './OvaVirtualMachinesRow';
import type { ProviderVirtualMachinesProps } from './ProviderVirtualMachines';

export const ovaVmFieldsMetadataFactory: ResourceFieldFactory = (t) => [
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
      placeholderLabel: t('Filter by path'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.OvaPath',
    label: t('OvaPath'),
    resourceFieldId: 'ovaPath',
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
