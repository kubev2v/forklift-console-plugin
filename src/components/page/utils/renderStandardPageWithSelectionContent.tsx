import type { ComponentProps, MutableRefObject, ReactElement } from 'react';

import StandardPage from '../StandardPage';

type RenderStandardPageArgs<T> = {
  canSelect?: (item: T) => boolean;
  finalHeader: ComponentProps<typeof StandardPage<T>>['header'];
  internalExpandedIds?: string[];
  internalSelectedIds?: string[];
  onSelect?: (selectedIds: string[]) => void;
  onSelectCallback: (selectedIds: string[]) => void;
  pageRef: MutableRefObject<number>;
  props: ComponentProps<typeof StandardPage<T>>;
  row: ComponentProps<typeof StandardPage<T>>['row'];
  toId?: (item: T) => string;
  toolbarItems?: ComponentProps<typeof StandardPage<T>>['GlobalActionToolbarItems'];
};

export const renderStandardPageWithSelectionContent = <T,>({
  canSelect,
  finalHeader,
  internalExpandedIds,
  internalSelectedIds,
  onSelect,
  onSelectCallback,
  pageRef,
  props,
  row,
  toId,
  toolbarItems,
}: RenderStandardPageArgs<T>): ReactElement => {
  const { cell: _cell, header: _header, resizableColumns, ...rest } = props;
  const selectionProps = onSelect
    ? {
        canSelect,
        expandedIds: internalExpandedIds,
        GlobalActionToolbarItems: toolbarItems,
        onSelect: onSelectCallback,
        pageRef,
        row,
        selectedIds: internalSelectedIds,
        toId,
      }
    : { expandedIds: internalExpandedIds, pageRef, row };

  return resizableColumns ? (
    <StandardPage {...rest} {...selectionProps} resizableColumns />
  ) : (
    <StandardPage {...rest} {...selectionProps} header={finalHeader} />
  );
};
