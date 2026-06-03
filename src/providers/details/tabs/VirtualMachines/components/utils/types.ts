import type { VmData } from 'src/providers/details/tabs/VirtualMachines/components/VMCellProps';

import type { ProviderData } from '@utils/providers/types';

export type ProviderVirtualMachinesListProps = {
  title?: string;
  obj: ProviderData;
  loaded?: boolean;
  loadError?: unknown;
  onSelect?: (selectedVMs: VmData[] | undefined) => void;
  initialSelectedIds?: string[];
  showActions: boolean;
  className?: string;
  hasCriticalConcernFilter?: boolean;
};
