import type { FC } from 'react';
import { enumToTuple } from 'src/components/common/FilterGroup/helpers';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';

import type { ResourceField } from '@components/common/utils/types';
import { TableSortContextProvider } from '@components/TableSortContextProvider';
import { t } from '@utils/i18n';
import { getAzureVM } from '@utils/types/azureVM';
import { getVmPowerState } from '@utils/virtual-machines/getVmPowerState';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
import type { VmData } from './components/VMCellProps';
import { getVmTableResourceFields } from './utils/helpers/getVmTableResourceFields';
import { AzureVirtualMachinesCells } from './AzureVirtualMachinesRow';

const azureVmFieldsMetadataFactory: ResourceField[] = [
  {
    filter: {
      placeholderLabel: t('Filter by name'),
      type: 'freetext',
    },
    isIdentity: true,
    isVisible: true,
    jsonPath: '$.name',
    label: t('Name'),
    resourceFieldId: 'name',
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
      placeholderLabel: t('Filter by size'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: (data: unknown) =>
      getAzureVM(data)?.object?.properties?.hardwareProfile?.vmSize ?? '',
    label: t('Size'),
    resourceFieldId: 'vmSize',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by operating system'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: (data: unknown) =>
      getAzureVM(data)?.object?.properties?.storageProfile?.osDisk?.osType ?? '',
    label: t('OS type'),
    resourceFieldId: 'osType',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by CPU count'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: (data: unknown) => getAzureVM(data)?.cpuCount ?? '',
    label: t('CPUs'),
    resourceFieldId: 'cpuCount',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by memory'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: (data: unknown) => getAzureVM(data)?.memoryMB ?? '',
    label: t('Memory (GB)'),
    resourceFieldId: 'memoryGB',
    sortable: true,
  },
];

export const AzureVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  hasCriticalConcernFilter,
  ...props
}) => {
  const fieldsMetadata = getVmTableResourceFields(
    azureVmFieldsMetadataFactory,
    hasCriticalConcernFilter,
  );

  return (
    <TableSortContextProvider fields={fieldsMetadata}>
      <ProviderVirtualMachinesList
        {...props}
        cellMapper={AzureVirtualMachinesCells}
        fieldsMetadata={fieldsMetadata}
        pageId="AzureVirtualMachinesList"
      />
    </TableSortContextProvider>
  );
};
