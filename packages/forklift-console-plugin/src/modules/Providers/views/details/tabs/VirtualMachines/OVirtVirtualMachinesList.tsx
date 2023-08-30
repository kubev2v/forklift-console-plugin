import React from 'react';

import { ResourceFieldFactory } from '@kubev2v/common';

import { OVirtVirtualMachinesRow } from './OVirtVirtualMachinesRow';
import {
  ProviderVirtualMachines,
  ProviderVirtualMachinesProps,
  vmsFieldsMetadataFactory,
} from './ProviderVirtualMachines';

export const oVirtVmFieldsMetadataFactory: ResourceFieldFactory = (t) => [
  ...vmsFieldsMetadataFactory(t),
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
    jsonPath: '$.vm.status',
    label: t('Status'),
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by status'),
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
  obj,
  loaded,
  loadError,
}) => (
  <ProviderVirtualMachines
    obj={obj}
    loaded={loaded}
    loadError={loadError}
    rowMapper={OVirtVirtualMachinesRow}
    fieldsMetadataFactory={oVirtVmFieldsMetadataFactory}
  />
);
