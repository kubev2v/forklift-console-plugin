import { type FormEvent, type SyntheticEvent, useState } from 'react';

import { InputGroup, SearchInput, ToolbarFilter } from '@patternfly/react-core';

import type { FilterTypeProps } from './types';

/**
 * This Filter type uses an unsensitive-case text provided by the user.
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
  onFilterUpdate,
  placeholderLabel,
  selectedFilters,
  showFilter = true,
  title,
}: FilterTypeProps) => {
  const [inputValue, setInputValue] = useState('');

  const onTextInput: (
    event: SyntheticEvent<HTMLButtonElement>,
    value: string,
    attrValueMap: Record<string, string>,
  ) => void = () => {
    const lowerCaseInputValue = inputValue?.toLowerCase();
    if (!lowerCaseInputValue || selectedFilters?.includes(lowerCaseInputValue)) {
      return;
    }
    onFilterUpdate([...(selectedFilters ?? []), lowerCaseInputValue]);
    setInputValue('');
  };

  const onChange: (event: FormEvent<HTMLInputElement>, value: string) => void = (_event, value) => {
    setInputValue(value);
  };

  const onClear: (event: SyntheticEvent<HTMLButtonElement>) => void = () => {
    setInputValue('');
  };

  return (
    <ToolbarFilter
      key={filterId}
      labels={selectedFilters ?? []}
      deleteLabel={(category, option) =>
        onFilterUpdate(selectedFilters?.filter((value) => value !== option) ?? [])
      }
      deleteLabelGroup={() => onFilterUpdate([])}
      categoryName={title ?? ''}
      showToolbarItem={showFilter}
    >
      <InputGroup>
        <SearchInput
          placeholder={placeholderLabel}
          value={inputValue}
          onChange={onChange}
          onSearch={onTextInput}
          onClear={onClear}
        />
      </InputGroup>
    </ToolbarFilter>
  );
};
