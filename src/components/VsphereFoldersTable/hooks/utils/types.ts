import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';

import type { Concern } from '@kubev2v/types';

export type VmKey = string;
export type FolderKey = string;

export type VmLookups = {
  name?: string;
  path?: string;
  host?: string;
  power?: string;
  concerns?: Concern[];
};

export type Indexes = {
  vmByKey: Map<VmKey, VmData>;
  folderToVmKeys: Map<FolderKey, VmKey[]>;
  tokensByVmKey: Map<VmKey, VmLookups>;
};

export type UseTreeRowsControls = {
  selectedVmKeys: string[];
  setSelectedVmKeys: (ids: string[]) => void;
};
