import type { FC, ReactElement } from 'react';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';

import { usePageSelectionState } from '../context/usePageSelectionContext';

/** Wraps a toolbar action so it receives current selectedIds from PageSelectionContext. */
export const createToolbarActionWithSelection = <T,>(
  Action: FC<GlobalActionToolbarProps<T>>,
  actionKey: string,
): FC<GlobalActionToolbarProps<T>> => {
  const ActionWithSelection = (props: GlobalActionToolbarProps<T>): ReactElement => {
    const { selectedIds } = usePageSelectionState();

    return <Action dataOnScreen={props.dataOnScreen} selectedIds={selectedIds ?? []} />;
  };
  ActionWithSelection.displayName = `${actionKey}WithSelection`;

  return ActionWithSelection;
};
