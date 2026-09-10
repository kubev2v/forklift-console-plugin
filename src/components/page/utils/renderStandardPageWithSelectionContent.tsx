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
  if (onSelect) {
    const { cell: _cell, ...rest } = props;

    return (
      <StandardPage
        {...rest}
        canSelect={canSelect}
        expandedIds={internalExpandedIds}
        GlobalActionToolbarItems={toolbarItems}
        header={finalHeader}
        onSelect={onSelectCallback}
        pageRef={pageRef}
        row={row}
        selectedIds={internalSelectedIds}
        toId={toId}
      />
    );
  }

  const { cell: _cell, ...restWithoutCell } = props;

  return (
    <StandardPage
      {...restWithoutCell}
      expandedIds={internalExpandedIds}
      header={finalHeader}
      pageRef={pageRef}
      row={row}
    />
  );
};
