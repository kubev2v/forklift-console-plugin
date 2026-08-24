import { type ForwardedRef, forwardRef, type ReactElement, useImperativeHandle } from 'react';

import { Select as PfSelect } from '@patternfly/react-core';

import { DEFAULT_PLACEHOLDER } from '../utils/constants';

import { useMultiTypeaheadSelect } from './hooks/useMultiTypeaheadSelect';
import type { MultiTypeaheadSelectProps } from './utils/types';
import MultiTypeaheadMenuToggle from './MultiTypeaheadMenuToggle';
import MultiTypeaheadSelectContent from './MultiTypeaheadSelectContent';

const EMPTY_VALUES: (string | number)[] = [];

const MultiTypeaheadSelect = (
  {
    allowClear = false,
    createOptionMessage,
    emptyState,
    filterControls,
    footer,
    isCreatable = false,
    isDisabled = false,
    listboxId,
    maxSelections,
    noOptionsMessage,
    noResultsMessage,
    onChange,
    onCreateOption,
    onInputChange,
    options,
    placeholder = DEFAULT_PLACEHOLDER,
    testId,
    toggleProps,
    toggleWidth,
    values = EMPTY_VALUES,
    ...selectProps
  }: MultiTypeaheadSelectProps,
  ref: ForwardedRef<HTMLInputElement>,
): ReactElement => {
  const {
    activeItemId,
    displayOptions,
    focusedItemIndex,
    handleSelect,
    inputRef,
    inputValue,
    isFiltering,
    isOpen,
    listboxId: listboxIdResolved,
    onChipRemove,
    onClearAll,
    onInputClick,
    onInputKeyDown,
    onInputValueChange,
    onOpenChange,
    onToggleClick,
    selectedOptions,
    setIsOpen,
  } = useMultiTypeaheadSelect({
    createOptionMessage,
    isCreatable,
    listboxId,
    maxSelections,
    noOptionsMessage,
    noResultsMessage,
    onChange,
    onCreateOption,
    onInputChange,
    options,
    values,
  });

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, [inputRef]);

  return (
    <PfSelect
      id="multi-create-typeahead-select"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSelect={(_event, selection: string | number | undefined) => {
        handleSelect(selection);
      }}
      selected={values}
      shouldFocusFirstItemOnOpen={false}
      toggle={(toggleRef) => (
        <MultiTypeaheadMenuToggle
          activeItemId={activeItemId}
          allowClear={allowClear}
          inputRef={inputRef}
          inputValue={inputValue}
          isDisabled={isDisabled}
          isFiltering={isFiltering}
          isOpen={isOpen}
          listboxId={listboxIdResolved}
          onChipRemove={onChipRemove}
          onClearAll={onClearAll}
          onInputChange={onInputChange}
          onInputClick={onInputClick}
          onInputKeyDown={onInputKeyDown}
          onInputValueChange={onInputValueChange}
          onToggleClick={onToggleClick}
          placeholder={placeholder}
          selectedOptions={selectedOptions}
          testId={testId}
          toggleProps={toggleProps}
          toggleRef={toggleRef}
          toggleWidth={toggleWidth}
        />
      )}
      {...selectProps}
    >
      <MultiTypeaheadSelectContent
        displayOptions={displayOptions}
        emptyState={emptyState}
        filterControls={filterControls}
        focusedItemIndex={focusedItemIndex}
        footer={footer}
        listboxId={listboxIdResolved}
        onFooterClick={() => {
          setIsOpen(false);
        }}
        options={options}
      />
    </PfSelect>
  );
};

export default forwardRef(MultiTypeaheadSelect);
