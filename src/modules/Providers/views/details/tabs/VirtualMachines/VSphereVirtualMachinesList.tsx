import type { FC } from 'react';
import { enumToTuple } from 'src/components/common/FilterGroup/helpers';

import type { VSphereVM } from '@kubev2v/types';
import { t } from '@utils/i18n';

import { ProviderVirtualMachinesList } from './components/ProviderVirtualMachinesList';
import type { VmData } from './components/VMCellProps';
import { concernFilter } from './utils/filters/concernFilter';
import { vsphereHostFilter } from './utils/filters/VsphereHostFilter';
import { getVmPowerState } from './utils/helpers/getVmPowerState';
import { useVSphereInventoryVms } from './utils/hooks/useVSphereInventoryVms';
import type { ProviderVirtualMachinesProps } from './ProviderVirtualMachines';
import { VSphereVirtualMachinesCells } from './VSphereVirtualMachinesRow';

export const vSphereVmFieldsMetadataFactory = [
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

export const VSphereVirtualMachinesList: FC<ProviderVirtualMachinesProps> = (props) => {
  const { obj } = props;
  const [hostsDict, foldersDict] = useVSphereInventoryVms({ provider: obj.provider }, true, null);
  const { vmData } = obj;

  /**
   * Processes the vmData to filter out templates,
   * and include folderName and hostName for each VM.
   *
   * @param {Array} vmData - The array of VM data objects.
   * @returns {Array} An array with updated VM data objects.
   */
  const newVMData = vmData
    .filter((data) => !(data.vm as VSphereVM).isTemplate)
    .map((data) => {
      const vm = data.vm as VSphereVM;
      const folder = foldersDict?.[vm.parent.id];
      const host = hostsDict?.[vm.host];

      return {
        ...data,
        folderName: folder?.name,
        hostName: host?.name,
      };
    });

  return (
    <ProviderVirtualMachinesList
      {...props}
      obj={{ ...obj, vmData: newVMData }}
      cellMapper={VSphereVirtualMachinesCells}
      fieldsMetadata={vSphereVmFieldsMetadataFactory}
      pageId="VSphereVirtualMachinesList"
    />
  );
};
