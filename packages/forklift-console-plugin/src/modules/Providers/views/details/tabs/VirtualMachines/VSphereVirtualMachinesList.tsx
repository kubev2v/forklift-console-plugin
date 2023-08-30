import React from 'react';

import { ResourceFieldFactory } from '@kubev2v/common';

import {
  ProviderVirtualMachines,
  ProviderVirtualMachinesProps,
  vmsFieldsMetadataFactory,
} from './ProviderVirtualMachines';
import { VSphereVirtualMachinesRow } from './VSphereVirtualMachinesRow';

export const vSphereVmFieldsMetadataFactory: ResourceFieldFactory = (t) => [
  ...vmsFieldsMetadataFactory(t),
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
    resourceFieldId: 'status',
    jsonPath: '$.vm.powerState',
    label: t('Status'),
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by status'),
    },
    sortable: true,
  },
];

export const VSphereVirtualMachinesList: React.FC<ProviderVirtualMachinesProps> = ({
  obj,
  loaded,
  loadError,
}) => (
  <ProviderVirtualMachines
    obj={obj}
    loaded={loaded}
    loadError={loadError}
    rowMapper={VSphereVirtualMachinesRow}
    fieldsMetadataFactory={vSphereVmFieldsMetadataFactory}
  />
);
