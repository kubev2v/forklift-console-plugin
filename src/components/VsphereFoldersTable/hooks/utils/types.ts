import type { ProviderVmData } from 'src/utils/types';

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
  vmByKey: Map<VmKey, ProviderVmData>;
  folderToVmKeys: Map<FolderKey, VmKey[]>;
  tokensByVmKey: Map<VmKey, VmLookups>;
};

export type UseTreeRowsControls = {
  selectedVmKeys: string[];
  setSelectedVmKeys: (ids: string[]) => void;
};
