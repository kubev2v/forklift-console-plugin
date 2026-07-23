import type { FC } from 'react';
import type { VmData } from 'src/providers/details/tabs/VirtualMachines/components/VMCellProps';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
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
  GlobalActionToolbarItems?: FC<GlobalActionToolbarProps<VmData>>[];
};
