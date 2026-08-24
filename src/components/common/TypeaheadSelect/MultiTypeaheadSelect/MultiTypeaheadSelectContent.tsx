import type { FC, ReactNode } from 'react';

import { MenuFooter, SelectList, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import type { TypeaheadSelectOption } from '../utils/types';

type MultiTypeaheadSelectContentProps = {
  displayOptions: TypeaheadSelectOption[];
  emptyState?: ReactNode;
  filterControls?: ReactNode;
  focusedItemIndex: number | null;
  footer?: ReactNode;
  listboxId: string;
  onFooterClick: () => void;
  options: TypeaheadSelectOption[];
};

const MultiTypeaheadSelectContent: FC<MultiTypeaheadSelectContentProps> = ({
  displayOptions,
  emptyState,
  filterControls,
  focusedItemIndex,
  footer,
  listboxId,
  onFooterClick,
  options,
}) => {
  if (isEmpty(options) && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      {filterControls}
      <SelectList id={listboxId} isAriaMultiselectable>
        {displayOptions.map((option, index) => {
          const { testId: optionTestId, ...restOptionProps } = option.optionProps ?? {};
          return (
            <SelectOption
              data-testid={optionTestId}
              id={String(option.value)}
              isFocused={focusedItemIndex === index}
              key={String(option.value)}
              value={option.value}
              {...restOptionProps}
            >
              {option.content}
            </SelectOption>
          );
        })}
      </SelectList>
      {footer && <MenuFooter onClick={onFooterClick}>{footer}</MenuFooter>}
    </>
  );
};

export default MultiTypeaheadSelectContent;
