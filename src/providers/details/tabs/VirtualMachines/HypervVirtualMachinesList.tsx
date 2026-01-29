import type { FC } from 'react';
import { enumToTuple } from 'src/components/common/FilterGroup/helpers';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';

import type { ResourceField } from '@components/common/utils/types';
import { TableSortContextProvider } from '@components/TableSortContextProvider';
import { t } from '@utils/i18n';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
import type { VmData } from './components/VMCellProps';
import { getConcernsResourceField } from './utils/helpers/getConcernsResourceField';
import { getVmPowerState } from './utils/helpers/getVmPowerState';
import { getVmTableResourceFields } from './utils/helpers/getVmTableResourceFields';
import { HypervVirtualMachinesCells } from './HypervVirtualMachinesRow';

const hypervVmFieldsMetadataFactory: ResourceField[] = [
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
  getConcernsResourceField(),
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
];

export const HypervVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  hasCriticalConcernFilter,
  ...props
}) => {
  const fieldsMetadata = getVmTableResourceFields(
    hypervVmFieldsMetadataFactory,
    hasCriticalConcernFilter,
  );

  return (
    <TableSortContextProvider fields={fieldsMetadata}>
      <ProviderVirtualMachinesList
        {...props}
        cellMapper={HypervVirtualMachinesCells}
        fieldsMetadata={fieldsMetadata}
        pageId="HypervVirtualMachinesList"
      />
    </TableSortContextProvider>
  );
};
