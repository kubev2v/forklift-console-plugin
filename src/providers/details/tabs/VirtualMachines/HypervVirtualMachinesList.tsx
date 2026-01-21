import type { FC } from 'react';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';

import { TableSortContextProvider } from '@components/TableSortContextProvider';
import { t } from '@utils/i18n';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
import { getConcernsResourceField } from './utils/helpers/getConcernsResourceField';
import { getVmTableResourceFields } from './utils/helpers/getVmTableResourceFields';
import { HypervVirtualMachinesCells } from './HypervVirtualMachinesRow';

const hypervVmFieldsMetadataFactory = [
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
