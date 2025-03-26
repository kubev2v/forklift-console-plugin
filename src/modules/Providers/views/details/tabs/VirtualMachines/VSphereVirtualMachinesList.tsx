import React from 'react';
import { EnumToTuple } from 'src/components/common/FilterGroup/helpers';

import { ResourceFieldFactory } from '@components/common/utils/types';
import { VSphereVM } from '@kubev2v/types';

import { concernFilter, VsphereHostFilter } from './utils/filters';
import { ProviderVirtualMachinesList, VmData } from './components';
import { ProviderVirtualMachinesProps } from './ProviderVirtualMachines';
import { getVmPowerState, useVSphereInventoryVms } from './utils';
import { VSphereVirtualMachinesCells } from './VSphereVirtualMachinesRow';

export const vSphereVmFieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    resourceFieldId: 'name',
    jsonPath: '$.name',
    label: t('Name'),
    isVisible: true,
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by name'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'concerns',
    jsonPath: '$.vm.concerns',
    label: t('Concerns'),
    isVisible: true,
    sortable: true,
    filter: concernFilter(t),
  },
  {
    resourceFieldId: 'host',
    jsonPath: '$.hostName',
    label: t('Host'),
    isVisible: true,
    isIdentity: false,
    sortable: true,
    filter: VsphereHostFilter(t),
  },
  {
    resourceFieldId: 'folder',
    jsonPath: '$.folderName',
    label: t('Folder'),
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by folder'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'path',
    jsonPath: '$.vm.path',
    label: t('Path'),
    isVisible: false,
    isIdentity: false,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by path'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'powerState',
    jsonPath: (data: VmData) => getVmPowerState(data?.vm),
    label: t('Power state'),
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'enum',
      placeholderLabel: t('Filter by power state'),
      values: EnumToTuple({ off: 'Off', on: 'On', unknown: 'Unknown' }),
    },
    sortable: true,
  },
];

export const VSphereVirtualMachinesList: React.FC<ProviderVirtualMachinesProps> = (props) => {
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
      fieldsMetadataFactory={vSphereVmFieldsMetadataFactory}
      pageId="VSphereVirtualMachinesList"
    />
  );
};
