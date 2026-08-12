import type { ProviderVmData } from 'src/utils/types';

import type { Concern } from '@forklift-ui/types';

export type VmLookups = {
  concerns?: Concern[];
  host?: string;
  name?: string;
  path?: string;
  power?: string;
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
