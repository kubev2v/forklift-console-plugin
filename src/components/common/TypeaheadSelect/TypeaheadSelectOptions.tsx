import type { FC, ReactNode } from 'react';

import { MenuFooter, SelectList, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import type { TypeaheadSelectOption } from './utils/types';

type TypeaheadSelectOptionsProps = {
  displayOptions: TypeaheadSelectOption[];
  emptyState?: ReactNode;
  filterControls?: ReactNode;
  footer?: ReactNode;
  onFooterClick: () => void;
  options: TypeaheadSelectOption[];
};

const TypeaheadSelectOptions: FC<TypeaheadSelectOptionsProps> = ({
  displayOptions,
  emptyState,
  filterControls,
  footer,
  onFooterClick,
  options,
}) => {
  if (isEmpty(options) && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      {filterControls}
      <SelectList id="typeahead-listbox">
        {displayOptions.map((option) => (
          <SelectOption key={option.value} value={option.value} {...option.optionProps}>
            {option.content}
          </SelectOption>
        ))}
      </SelectList>
      {footer && (
        <MenuFooter className="pf-v6-u-pt-sm" onClick={onFooterClick}>
          {footer}
        </MenuFooter>
      )}
    </>
  );
};

export default TypeaheadSelectOptions;
