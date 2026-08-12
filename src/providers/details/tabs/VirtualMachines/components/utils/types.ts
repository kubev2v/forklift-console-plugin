import type { FC } from 'react';
import type { VmData } from 'src/providers/details/tabs/VirtualMachines/components/VMCellProps';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import type { ProviderData } from '@utils/providers/types';

export type ProviderVirtualMachinesListProps = {
  className?: string;
  GlobalActionToolbarItems?: FC<GlobalActionToolbarProps<VmData>>[];
  hasCriticalConcernFilter?: boolean;
  initialSelectedIds?: string[];
  loaded?: boolean;
  loadError?: unknown;
  obj: ProviderData;
  onSelect?: (selectedVMs: VmData[] | undefined) => void;
  showActions: boolean;
  title?: string;
};
