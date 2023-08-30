import React from 'react';

import { ResourceFieldFactory } from '@kubev2v/common';

import { OpenStackVirtualMachinesRow } from './OpenStackVirtualMachinesRow';
import {
  ProviderVirtualMachines,
  ProviderVirtualMachinesProps,
  vmsFieldsMetadataFactory,
} from './ProviderVirtualMachines';

export const openStackVmFieldsMetadataFactory: ResourceFieldFactory = (t) => [
  ...vmsFieldsMetadataFactory(t),
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
  <ProviderVirtualMachines
    obj={obj}
    loaded={loaded}
    loadError={loadError}
    rowMapper={OpenStackVirtualMachinesRow}
    fieldsMetadataFactory={openStackVmFieldsMetadataFactory}
  />
);
