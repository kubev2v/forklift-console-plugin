import React from 'react';

import { ResourceFieldFactory } from '@kubev2v/common';

import { OvaVirtualMachinesRow } from './OvaVirtualMachinesRow';
import {
  ProviderVirtualMachines,
  ProviderVirtualMachinesProps,
  vmsFieldsMetadataFactory,
} from './ProviderVirtualMachines';

export const ovaVmFieldsMetadataFactory: ResourceFieldFactory = (t) => [
  ...vmsFieldsMetadataFactory(t),
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

export const OvaVirtualMachinesList: React.FC<ProviderVirtualMachinesProps> = ({
  obj,
  loaded,
  loadError,
}) => (
  <ProviderVirtualMachines
    obj={obj}
    loaded={loaded}
    loadError={loadError}
    rowMapper={OvaVirtualMachinesRow}
    fieldsMetadataFactory={ovaVmFieldsMetadataFactory}
  />
);
