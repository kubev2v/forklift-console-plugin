import type { FC } from 'react';

import { t } from '@utils/i18n';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
import { concernFilter } from './utils/filters/concernFilter';
import { OvaVirtualMachinesCells } from './OvaVirtualMachinesRow';
import type { ProviderVirtualMachinesProps } from './ProviderVirtualMachines';

export const ovaVmFieldsMetadataFactory = [
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
    filter: concernFilter(),
    isVisible: true,
    jsonPath: '$.vm.concerns',
    label: t('Concerns'),
    resourceFieldId: 'concerns',
    sortable: true,
  },
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

export const OvaVirtualMachinesList: FC<ProviderVirtualMachinesProps> = (props) => (
  <ProviderVirtualMachinesList
    {...props}
    cellMapper={OvaVirtualMachinesCells}
    fieldsMetadata={ovaVmFieldsMetadataFactory}
    pageId="OvaVirtualMachinesList"
  />
);
