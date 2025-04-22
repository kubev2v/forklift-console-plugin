import type { FC } from 'react';
import { enumToTuple } from 'src/components/common/FilterGroup/helpers';

import { t } from '@utils/i18n';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
import type { VmData } from './components/VMCellProps';
import { concernFilter } from './utils/filters/concernFilter';
import { getVmPowerState } from './utils/helpers/getVmPowerState';
import { OpenStackVirtualMachinesCells } from './OpenStackVirtualMachinesRow';
import type { ProviderVirtualMachinesProps } from './ProviderVirtualMachines';

export const openStackVmFieldsMetadataFactory = [
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
      placeholderLabel: t('Filter by host'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.hostID',
    label: t('Host'),
    resourceFieldId: 'hostID',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by path'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.path',
    label: t('Path'),
    resourceFieldId: 'path',
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
      placeholderLabel: t('Filter by tenant'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.tenantID',
    label: t('Tenant'),
    resourceFieldId: 'tenantID',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by image'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.imageID',
    label: t('Image'),
    resourceFieldId: 'imageID',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by flavor'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.flavorID',
    label: t('Flavor'),
    resourceFieldId: 'flavorID',
    sortable: true,
  },
];

export const OpenStackVirtualMachinesList: FC<ProviderVirtualMachinesProps> = (props) => (
  <ProviderVirtualMachinesList
    {...props}
    cellMapper={OpenStackVirtualMachinesCells}
    fieldsMetadata={openStackVmFieldsMetadataFactory}
    pageId="OpenStackVirtualMachinesList"
  />
);
