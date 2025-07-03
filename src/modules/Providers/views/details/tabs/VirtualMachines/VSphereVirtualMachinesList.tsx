import type { FC } from 'react';
import { enumToTuple } from 'src/components/common/FilterGroup/helpers';
import type { ProviderVirtualMachinesListProps } from 'src/providers/details/tabs/VirtualMachines/components/utils/types';

import { TableSortContextProvider } from '@components/TableSortContext';
import type { OVirtHost, VSphereHostInventory, VSphereVM } from '@kubev2v/types';
import { t } from '@utils/i18n';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
import type { VmData } from './components/VMCellProps';
import { vsphereHostFilter } from './utils/filters/VsphereHostFilter';
import { getConcernsResourceField } from './utils/helpers/getConcernsResourceField';
import { getVmPowerState } from './utils/helpers/getVmPowerState';
import { getVmTableResourceFields } from './utils/helpers/getVmTableResourceFields';
import { useVSphereInventoryVms } from './utils/hooks/useVSphereInventoryVms';
import { VSphereVirtualMachinesCells } from './VSphereVirtualMachinesRow';

const vSphereVmFieldsMetadataFactory = [
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
    filter: vsphereHostFilter(),
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.hostName',
    label: t('Host'),
    resourceFieldId: 'host',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by folder'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: '$.folderName',
    label: t('Folder'),
    resourceFieldId: 'folder',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by path'),
      type: 'freetext',
    },
    isIdentity: false,
    isVisible: false,
    jsonPath: '$.vm.path',
    label: t('Path'),
    resourceFieldId: 'path',
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by power state'),
      type: 'enum',
      values: enumToTuple({ off: 'Off', on: 'On', unknown: 'Unknown' }),
    },
    isIdentity: false,
    isVisible: true,
    jsonPath: (data: VmData) => getVmPowerState(data?.vm),
    label: t('Power state'),
    resourceFieldId: 'powerState',
    sortable: true,
  },
];

export const VSphereVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = (props) => {
  const { hasCriticalConcernFilter, obj } = props;
  const [hostsDict, foldersDict, isVsphereInventoryLoading] = useVSphereInventoryVms(
    { provider: obj.provider },
    true,
    null,
  );
  const { vmData, vmDataLoading } = obj;
  const isLoading = vmDataLoading === true || isVsphereInventoryLoading;

  const fieldsMetadata = getVmTableResourceFields(
    vSphereVmFieldsMetadataFactory,
    hasCriticalConcernFilter,
  );

  /**
   * Processes the vmData to filter out templates,
   * and include folderName and hostName for each VM.
   *
   * @param {Array} vmData - The array of VM data objects.
   * @returns {Array} An array with updated VM data objects.
   */
  const newVMData = vmData
    ?.filter((data) => !(data.vm as VSphereVM).isTemplate)
    ?.map((data) => {
      const vm = data.vm as VSphereVM;
      const folder = foldersDict?.[vm.parent.id];
      const host: OVirtHost | VSphereHostInventory = hostsDict?.[vm.host];

      return {
        ...data,
        folderName: folder?.name,
        hostName: host?.name,
      };
    });

  return (
    <TableSortContextProvider fields={fieldsMetadata}>
      <ProviderVirtualMachinesList
        {...props}
        cellMapper={VSphereVirtualMachinesCells}
        fieldsMetadata={fieldsMetadata}
        pageId="VSphereVirtualMachinesList"
        obj={{ ...obj, vmData: newVMData, vmDataLoading: isLoading }}
      />
    </TableSortContextProvider>
  );
};
