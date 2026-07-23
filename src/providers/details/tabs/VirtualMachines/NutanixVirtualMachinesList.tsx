import type { FC } from 'react';
import { enumToTuple } from 'src/components/common/FilterGroup/helpers';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';

import type { ResourceField } from '@components/common/utils/types';
import { TableSortContextProvider } from '@components/TableSortContextProvider';
import { t } from '@utils/i18n';
import { getVmPowerState } from '@utils/virtual-machines/getVmPowerState';
import { getVmGuestOS } from '@utils/vm/getVmGuestOS';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
import type { VmData } from './components/VMCellProps';
import { getConcernsResourceField } from './utils/helpers/getConcernsResourceField';
import { getVmTableResourceFields } from './utils/helpers/getVmTableResourceFields';
import { NutanixVirtualMachinesCells } from './NutanixVirtualMachinesRow';

const nutanixVmFieldsMetadataFactory: ResourceField[] = [
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
      placeholderLabel: t('Filter by cluster'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.cluster',
    label: t('Cluster'),
    resourceFieldId: 'cluster',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by host'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.host',
    label: t('Host'),
    resourceFieldId: 'host',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by guest OS'),
      type: 'freetext',
    },
    isVisible: true,
    jsonPath: (data: unknown) => getVmGuestOS((data as VmData)?.vm),
    label: t('Guest OS'),
    resourceFieldId: 'guestOS',
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
];

export const NutanixVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  hasCriticalConcernFilter,
  ...props
}) => {
  const fieldsMetadata = getVmTableResourceFields(
    nutanixVmFieldsMetadataFactory,
    hasCriticalConcernFilter,
  );

  return (
    <TableSortContextProvider fields={fieldsMetadata}>
      <ProviderVirtualMachinesList
        {...props}
        cellMapper={NutanixVirtualMachinesCells}
        fieldsMetadata={fieldsMetadata}
        pageId="NutanixVirtualMachinesList"
      />
    </TableSortContextProvider>
  );
};
