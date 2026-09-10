import type { FC } from 'react';

import type { RowProps } from '@components/common/TableView/types';

import SelectionRow from '../components/SelectionRow';

/** Returns the stable SelectionRow component (identity does not change across selection toggles). */
export const createRowWithSelection = <T>(): FC<RowProps<T>> => SelectionRow as FC<RowProps<T>>;
