import React from 'react';

import { EnumToTuple, ResourceFieldFactory } from '@kubev2v/common';

import { ProviderVirtualMachinesList, VmData } from './components/ProviderVirtualMachinesList';
import { getVmPowerState } from './utils/helpers/getVmPowerState';
import { OpenShiftVirtualMachinesRow } from './OpenShiftVirtualMachinesRow';
import { ProviderVirtualMachinesProps } from './ProviderVirtualMachines';

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
