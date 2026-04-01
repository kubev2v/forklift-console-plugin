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
import { getEc2VM } from './utils/types/Ec2VM';
import { Ec2VirtualMachinesCells } from './Ec2VirtualMachinesRow';

const ec2VmFieldsMetadataFactory: ResourceField[] = [
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
  {
    filter: {
      placeholderLabel: t('Filter by instance type'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: (data: unknown) => getEc2VM(data)?.object?.InstanceType ?? '',
    label: t('Instance type'),
    resourceFieldId: 'instanceType',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by availability zone'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: (data: unknown) => getEc2VM(data)?.object?.Placement?.AvailabilityZone ?? '',
    label: t('Availability zone'),
    resourceFieldId: 'availabilityZone',
    sortable: true,
  },
];

export const Ec2VirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  hasCriticalConcernFilter,
  ...props
}) => {
  const fieldsMetadata = getVmTableResourceFields(
    ec2VmFieldsMetadataFactory,
    hasCriticalConcernFilter,
  );

  return (
    <TableSortContextProvider fields={fieldsMetadata}>
      <ProviderVirtualMachinesList
        {...props}
        cellMapper={Ec2VirtualMachinesCells}
        fieldsMetadata={fieldsMetadata}
        pageId="Ec2VirtualMachinesList"
      />
    </TableSortContextProvider>
  );
};
