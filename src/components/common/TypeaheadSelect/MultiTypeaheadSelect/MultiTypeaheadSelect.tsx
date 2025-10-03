import { type ForwardedRef, forwardRef, type ReactNode, useImperativeHandle } from 'react';

import {
  MenuFooter,
  type MenuToggleProps,
  Select as PfSelect,
  SelectList,
  SelectOption,
  type SelectProps,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { DEFAULT_PLACEHOLDER } from '../utils/constants';
import type { TypeaheadSelectOption } from '../utils/types';

import { useMultiTypeaheadSelect } from './hooks/useMultiTypeaheadSelect';
import MultiTypeaheadMenuToggle from './MultiTypeaheadMenuToggle';

type MultiTypeaheadSelectProps = {
  options: TypeaheadSelectOption[];
  values?: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  onCreateOption?: (createdValue: string) => void;
  onInputChange?: (inputValue: string) => void;

  allowClear?: boolean;
  placeholder?: string;
  isCreatable?: boolean;
  createOptionMessage?: string | ((value: string) => string);
  noOptionsMessage?: string;
  emptyState?: ReactNode;
  noResultsMessage?: string | ((filter: string) => string);
  footer?: ReactNode;
  isDisabled?: boolean;
  toggleWidth?: string;
  toggleProps?: Omit<MenuToggleProps, 'innerRef' | 'onClick' | 'isExpanded' | 'variant'>;
  filterControls?: ReactNode;
  maxSelections?: number;
  testId?: string;
  listboxId?: string;
} & Omit<SelectProps, 'toggle' | 'onSelect' | 'selected' | 'isOpen'>;

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
    options = [],
    placeholder = DEFAULT_PLACEHOLDER,
    testId,
    toggleProps,
    toggleWidth,
    values = [],
    ...selectProps
  }: MultiTypeaheadSelectProps,
  ref: ForwardedRef<HTMLInputElement>,
) => {
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

  useImperativeHandle(ref, () => inputRef.current!, [inputRef]);

  return (
    <PfSelect
      id="multi-create-typeahead-select"
      isOpen={isOpen}
      selected={values}
      onSelect={(_event, selection) => {
        handleSelect(selection);
      }}
      onOpenChange={onOpenChange}
      toggle={(toggleRef) => (
        <MultiTypeaheadMenuToggle
          toggleRef={toggleRef}
          inputRef={inputRef}
          placeholder={placeholder}
          isDisabled={isDisabled}
          isOpen={isOpen}
          toggleWidth={toggleWidth}
          allowClear={allowClear}
          selectedOptions={selectedOptions}
          isFiltering={isFiltering}
          inputValue={inputValue}
          onInputChange={onInputChange}
          onClearAll={onClearAll}
          onToggleClick={onToggleClick}
          onInputValueChange={onInputValueChange}
          onChipRemove={onChipRemove}
          toggleProps={toggleProps}
          testId={testId}
          onInputClick={onInputClick}
          onInputKeyDown={onInputKeyDown}
          activeItemId={activeItemId}
          listboxId={listboxIdResolved}
        />
      )}
      shouldFocusFirstItemOnOpen={false}
      {...selectProps}
    >
      {isEmpty(options) && emptyState ? (
        emptyState
      ) : (
        <>
          {filterControls}
          <SelectList id={listboxIdResolved} isAriaMultiselectable>
            {displayOptions.map((option, index) => {
              const { 'data-testid': dataTestId, ...restOptionProps } = option.optionProps ?? {};
              return (
                <SelectOption
                  key={String(option.value)}
                  id={String(option.value)} // optional: createItemId if you want stable IDs
                  isFocused={focusedItemIndex === index}
                  value={option.value}
                  data-testid={dataTestId}
                  {...restOptionProps}
                >
                  {option.content}
                </SelectOption>
              );
            })}
          </SelectList>
          {footer && (
            <MenuFooter
              onClick={() => {
                setIsOpen(false);
              }}
            >
              {footer}
            </MenuFooter>
          )}
        </>
      )}
    </PfSelect>
  );
};

export default forwardRef(MultiTypeaheadSelect);
