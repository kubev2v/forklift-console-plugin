import type { FC } from 'react';
import { enumToTuple } from 'src/components/common/FilterGroup/helpers';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';

import { t } from '@utils/i18n';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
import type { VmData } from './components/VMCellProps';
import { ovirtHostFilter } from './utils/filters/OvirtHostFilter';
import { getConcernsResourceField } from './utils/helpers/getConcernsResourceField';
import { getVmPowerState } from './utils/helpers/getVmPowerState';
import { getVmTableResourceFields } from './utils/helpers/getVmTableResourceFields';
import { OVirtVirtualMachinesCells } from './OVirtVirtualMachinesRow';

const oVirtVmFieldsMetadataFactory = [
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
    filter: ovirtHostFilter(),
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.host',
    label: t('Host'),
    resourceFieldId: 'host',
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
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.vm.description',
    label: t('Description'),
    resourceFieldId: 'description',
    sortable: false,
  },
];

export const OVirtVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  hasCriticalConcernFilter,
  ...props
}) => (
  <ProviderVirtualMachinesList
    {...props}
    cellMapper={OVirtVirtualMachinesCells}
    fieldsMetadata={getVmTableResourceFields(
      oVirtVmFieldsMetadataFactory,
      hasCriticalConcernFilter,
    )}
    pageId="OVirtVirtualMachinesList"
  />
);
