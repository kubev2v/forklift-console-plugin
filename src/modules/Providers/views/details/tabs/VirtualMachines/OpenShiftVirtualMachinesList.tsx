import type { FC } from 'react';
import { enumToTuple } from 'src/components/common/FilterGroup/helpers';

import { t } from '@utils/i18n';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
import type { VmData } from './components/VMCellProps';
import { getOpenShiftFeatureMap } from './utils/helpers/getOpenShiftFeatureMap';
import { getVmPowerState } from './utils/helpers/getVmPowerState';
import { toVmFeatureEnum } from './utils/helpers/toVmFeatureEnum';
import { OpenShiftVirtualMachinesCells } from './OpenShiftVirtualMachinesRow';
import type { ProviderVirtualMachinesProps } from './ProviderVirtualMachines';

export const openShiftVmFieldsMetadataFactory = [
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
    filter: {
      placeholderLabel: t('Filter by namespace'),
      type: 'freetext',
    },
    isIdentity: true,
    isVisible: true,
    jsonPath: '$.vm.object.metadata.namespace',
    label: t('Namespace'),
    resourceFieldId: 'possiblyRemoteNamespace',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by status'),
      type: 'enum',
      values: enumToTuple({ off: 'Off', on: 'On', unknown: 'Unknown' }),
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: (data: VmData) => getVmPowerState(data?.vm),
    label: t('Status'),
    resourceFieldId: 'status',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by features'),
      type: 'features',
      values: enumToTuple(toVmFeatureEnum()),
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: (data: VmData) => getOpenShiftFeatureMap(data?.vm),
    label: t('Features'),
    resourceFieldId: 'features',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by template'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: "$.vm.object.metadata.labels['vm.kubevirt.io/template']",
    label: t('Template'),
    resourceFieldId: 'template',
    sortable: true,
  },
];

export const OpenShiftVirtualMachinesList: FC<ProviderVirtualMachinesProps> = (props) => (
  <ProviderVirtualMachinesList
    {...props}
    cellMapper={OpenShiftVirtualMachinesCells}
    fieldsMetadata={openShiftVmFieldsMetadataFactory}
    pageId="OpenShiftVirtualMachinesList"
  />
);
