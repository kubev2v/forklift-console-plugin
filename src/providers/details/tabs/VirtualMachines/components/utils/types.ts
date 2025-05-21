import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';

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
