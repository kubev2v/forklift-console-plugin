import type { FC, ReactElement } from 'react';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';

/** Wraps a toolbar action so it receives the pruned selectedIds injected by the page. */
export const createToolbarActionWithSelection = <T,>(
  Action: FC<GlobalActionToolbarProps<T>>,
  actionKey: string,
): FC<GlobalActionToolbarProps<T>> => {
  const ActionWithSelection = (props: GlobalActionToolbarProps<T>): ReactElement => (
    <Action dataOnScreen={props.dataOnScreen} selectedIds={props.selectedIds ?? []} />
  );
  ActionWithSelection.displayName = `${actionKey}WithSelection`;

  return ActionWithSelection;
};
