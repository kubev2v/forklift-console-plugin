import { type FC, useSyncExternalStore } from 'react';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import SelectedToggle from '@components/SelectedToggle/SelectedToggle';
import type { ShowAllStore } from '@components/SelectedToggle/showAllStore';

type SelectedToggleActionProps = GlobalActionToolbarProps<unknown> & {
  store: ShowAllStore;
};

const SelectedToggleAction: FC<SelectedToggleActionProps> = ({
  selectedIds: toolbarSelectedIds = [],
  store,
}) => {
  const showAll = useSyncExternalStore(store.subscribe, store.getSnapshot);

  return (
    <SelectedToggle
      selectedVmKeys={toolbarSelectedIds}
      setShowAll={store.setShowAll}
      showAll={showAll}
    />
  );
};

export default SelectedToggleAction;
