import type { FC } from 'react';
import { enumToTuple } from 'src/components/common/FilterGroup/helpers';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';

import { t } from '@utils/i18n';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
import type { VmData } from './components/VMCellProps';
import { getConcernsResourceField } from './utils/helpers/getConcernsResourceField';
import { getVmPowerState } from './utils/helpers/getVmPowerState';
import { getVmTableResourceFields } from './utils/helpers/getVmTableResourceFields';
import { OpenStackVirtualMachinesCells } from './OpenStackVirtualMachinesRow';

const openStackVmFieldsMetadataFactory = [
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

export const OpenStackVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  hasCriticalConcernFilter,
  ...props
}) => (
  <ProviderVirtualMachinesList
    {...props}
    cellMapper={OpenStackVirtualMachinesCells}
    fieldsMetadata={getVmTableResourceFields(
      openStackVmFieldsMetadataFactory,
      hasCriticalConcernFilter,
    )}
    pageId="OpenStackVirtualMachinesList"
  />
);
