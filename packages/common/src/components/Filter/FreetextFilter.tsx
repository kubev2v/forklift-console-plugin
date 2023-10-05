import React, { useState } from 'react';

import { InputGroup, SearchInput, ToolbarFilter } from '@patternfly/react-core';

import { FilterTypeProps } from './types';

/**
 * This Filter type uses text provided by the user.
 * Text needs to be submitted/confirmed by clicking search button or by pressing Enter key.
 *
 * **FilterTypeProps are interpreted as follows** :<br>
 * 1) selectedFilters - list of strings provided by the user<br>
 * 2) onFilterUpdate - accepts the list of strings (from user input)
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/Filter/FreetextFilter.tsx)
 */
export const FreetextFilter = ({
  filterId,
  selectedFilters,
  onFilterUpdate,
  title,
  showFilter = true,
  placeholderLabel,
}: FilterTypeProps) => {
  const [inputValue, setInputValue] = useState('');
  const onTextInput = (): void => {
    if (!inputValue || selectedFilters.includes(inputValue)) {
      return;
    }
    onFilterUpdate([...selectedFilters, inputValue]);
    setInputValue('');
  };
  return (
    <ToolbarFilter
      key={filterId}
      chips={selectedFilters ?? []}
      deleteChip={(category, option) =>
        onFilterUpdate(selectedFilters?.filter((value) => value !== option) ?? [])
      }
      deleteChipGroup={() => onFilterUpdate([])}
      categoryName={title}
      showToolbarItem={showFilter}
    >
      <InputGroup>
        <SearchInput
          placeholder={placeholderLabel}
          value={inputValue}
          onChange={(event, value) => {
            setInputValue(value);
          }}
          onSearch={onTextInput}
          onClear={() => setInputValue('')}
        />
      </InputGroup>
    </ToolbarFilter>
  );
};
