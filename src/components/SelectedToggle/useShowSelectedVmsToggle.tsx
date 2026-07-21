import { type FC, useEffect, useMemo, useState } from 'react';
import type { VmData } from 'src/providers/details/tabs/VirtualMachines/components/VMCellProps';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import SelectedToggle from '@components/SelectedToggle/SelectedToggle';
import { isEmpty } from '@utils/helpers';

type UseShowSelectedVmsToggleResult = {
  showSelectedOnly: boolean;
  GlobalActionToolbarItems: FC<GlobalActionToolbarProps<VmData>>[] | undefined;
};

const useShowSelectedVmsToggle = (
  isEnabled: boolean,
  selectedIds: string[],
): UseShowSelectedVmsToggleResult => {
  const [showAll, setShowAll] = useState(true);

  useEffect(() => {
    if (isEmpty(selectedIds) && !showAll) {
      setShowAll(true);
    }
  }, [selectedIds, showAll]);

  const GlobalActionToolbarItems = useMemo(() => {
    if (!isEnabled) {
      return undefined;
    }

    return [
      ({ selectedIds: toolbarSelectedIds = [] }: GlobalActionToolbarProps<VmData>) => (
        <SelectedToggle
          showAll={showAll}
          setShowAll={setShowAll}
          selectedVmKeys={toolbarSelectedIds}
        />
      ),
    ];
  }, [isEnabled, showAll]);

  return {
    GlobalActionToolbarItems,
    showSelectedOnly: isEnabled && !showAll,
  };
};

export default useShowSelectedVmsToggle;
