import { type FC, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import SelectedToggleAction from '@components/SelectedToggle/SelectedToggleAction';
import { createShowAllStore, type ShowAllStore } from '@components/SelectedToggle/showAllStore';
import { isEmpty } from '@utils/helpers';

type UseShowSelectedVmsToggleResult<T> = {
  showSelectedOnly: boolean;
  GlobalActionToolbarItems: FC<GlobalActionToolbarProps<T>>[] | undefined;
};

const useShowSelectedVmsToggle = <T = unknown,>(
  isEnabled: boolean,
  selectedIds: string[],
): UseShowSelectedVmsToggleResult<T> => {
  const storeRef = useRef<ShowAllStore | null>(null);
  storeRef.current ??= createShowAllStore();
  const store = storeRef.current;

  const showAll = useSyncExternalStore(store.subscribe, store.getSnapshot);

  useEffect(() => {
    if (isEmpty(selectedIds) && !showAll) {
      store.setShowAll(true);
    }
  }, [selectedIds, showAll, store]);

  const GlobalActionToolbarItems = useMemo(() => {
    if (!isEnabled) {
      return undefined;
    }

    const Action: FC<GlobalActionToolbarProps<T>> = (props) => (
      <SelectedToggleAction {...props} store={store} />
    );

    return [Action];
  }, [isEnabled, store]);

  return {
    GlobalActionToolbarItems,
    showSelectedOnly: isEnabled && !showAll,
  };
};

export default useShowSelectedVmsToggle;
