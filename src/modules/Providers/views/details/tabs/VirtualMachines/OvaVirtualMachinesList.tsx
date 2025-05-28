import type { FC } from 'react';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';

import { t } from '@utils/i18n';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
import { getConcernsResourceField } from './utils/helpers/getConcernsResourceField';
import { getVmTableResourceFields } from './utils/helpers/getVmTableResourceFields';
import { OvaVirtualMachinesCells } from './OvaVirtualMachinesRow';

const ovaVmFieldsMetadataFactory = [
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
  getConcernsResourceField(),
  {
    filter: {
      placeholderLabel: t('Filter by path'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.OvaPath',
    label: t('OvaPath'),
    resourceFieldId: 'ovaPath',
    sortable: true,
  },
];

export const OvaVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  hasCriticalConcernFilter,
  ...props
}) => (
  <ProviderVirtualMachinesList
    {...props}
    cellMapper={OvaVirtualMachinesCells}
    fieldsMetadata={getVmTableResourceFields(ovaVmFieldsMetadataFactory, hasCriticalConcernFilter)}
    pageId="OvaVirtualMachinesList"
  />
);
