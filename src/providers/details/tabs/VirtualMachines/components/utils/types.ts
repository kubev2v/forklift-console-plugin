import type { VmData } from 'src/providers/details/tabs/VirtualMachines/components/VMCellProps';
import type { ProviderData } from 'src/providers/utils/types/ProviderData';

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
