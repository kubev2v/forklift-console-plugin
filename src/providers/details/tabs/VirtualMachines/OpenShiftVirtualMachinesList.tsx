import type { FC } from 'react';
import { enumToTuple } from 'src/components/common/FilterGroup/helpers';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';

import type { ResourceField } from '@components/common/utils/types';
import { TableSortContextProvider } from '@components/TableSortContextProvider';
import { t } from '@utils/i18n';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
import type { VmData } from './components/VMCellProps';
import { getOpenShiftFeatureMap } from './utils/helpers/getOpenShiftFeatureMap';
import { getVmPowerState } from './utils/helpers/getVmPowerState';
import { toVmFeatureEnum } from './utils/helpers/toVmFeatureEnum';
import { CustomFilterType } from './constants';
import { OpenShiftVirtualMachinesCells } from './OpenShiftVirtualMachinesRow';

const openShiftVmFieldsMetadataFactory: ResourceField[] = [
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
      placeholderLabel: t('Filter by project'),
      type: 'freetext',
    },
    isIdentity: true,
    isVisible: true,
    jsonPath: '$.vm.object.metadata.namespace',
    label: t('Project'),
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
    jsonPath: (data: unknown) => getVmPowerState((data as VmData)?.vm),
    label: t('Status'),
    resourceFieldId: 'status',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by features'),
      type: CustomFilterType.Features,
      values: enumToTuple(toVmFeatureEnum()),
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: (data: unknown) => getOpenShiftFeatureMap((data as VmData)?.vm),
    label: t('Features'),
    resourceFieldId: CustomFilterType.Features,
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

export const OpenShiftVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = (props) => (
  <TableSortContextProvider fields={openShiftVmFieldsMetadataFactory}>
    <ProviderVirtualMachinesList
      {...props}
      cellMapper={OpenShiftVirtualMachinesCells}
      fieldsMetadata={openShiftVmFieldsMetadataFactory}
      pageId="OpenShiftVirtualMachinesList"
    />
  </TableSortContextProvider>
);
