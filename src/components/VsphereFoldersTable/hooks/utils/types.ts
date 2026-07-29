import type { ProviderVmData } from 'src/utils/types';

import type { Concern } from '@forklift-ui/types';

export type VmLookups = {
  name?: string;
  path?: string;
  host?: string;
  power?: string;
  concerns?: Concern[];
};

export type Indexes = {
  folderToVmKeys: Map<string, string[]>;
  tokensByVmKey: Map<string, VmLookups>;
  vmByKey: Map<string, ProviderVmData>;
};

export type UseTreeRowsControls = {
  selectedVmKeys: string[];
  setSelectedVmKeys: (ids: string[]) => void;
};
