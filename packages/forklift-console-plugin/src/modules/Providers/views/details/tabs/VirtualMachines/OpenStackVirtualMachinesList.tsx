import React from 'react';

import { EnumToTuple, ResourceFieldFactory } from '@kubev2v/common';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
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
