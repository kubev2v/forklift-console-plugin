import React from 'react';

import { EnumToTuple, ResourceFieldFactory } from '@kubev2v/common';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
import { VmData } from './components';
import { OpenShiftVirtualMachinesRow } from './OpenShiftVirtualMachinesRow';
import { ProviderVirtualMachinesProps } from './ProviderVirtualMachines';
import { getVmPowerState } from './utils';

const openShiftVmFieldsMetadataFactory: ResourceFieldFactory = (t) => [
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
    resourceFieldId: 'status',
    jsonPath: (data: VmData) => getVmPowerState(data?.vm),
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
];

export const OpenShiftVirtualMachinesList: React.FC<ProviderVirtualMachinesProps> = ({
  obj,
  loaded,
  loadError,
}) => (
  <ProviderVirtualMachinesList
    obj={obj}
    loaded={loaded}
    loadError={loadError}
    rowMapper={OpenShiftVirtualMachinesRow}
    fieldsMetadataFactory={openShiftVmFieldsMetadataFactory}
    pageId="OpenShiftVirtualMachinesList"
  />
);
