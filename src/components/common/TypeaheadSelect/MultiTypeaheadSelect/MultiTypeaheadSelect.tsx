import {
  type ForwardedRef,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useImperativeHandle,
} from 'react';

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
  allowClear?: boolean;
  createOptionMessage?: string | ((value: string) => string);
  emptyState?: ReactNode;
  filterControls?: ReactNode;
  footer?: ReactNode;

  isCreatable?: boolean;
  isDisabled?: boolean;
  listboxId?: string;
  maxSelections?: number;
  noOptionsMessage?: string;
  noResultsMessage?: string | ((filter: string) => string);
  onChange: (values: (string | number)[]) => void;
  onCreateOption?: (createdValue: string) => void;
  onInputChange?: (inputValue: string) => void;
  options: TypeaheadSelectOption[];
  placeholder?: string;
  testId?: string;
  toggleProps?: Omit<MenuToggleProps, 'innerRef' | 'onClick' | 'isExpanded' | 'variant'>;
  toggleWidth?: string;
  values?: (string | number)[];
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
    options,
    placeholder = DEFAULT_PLACEHOLDER,
    testId,
    toggleProps,
    toggleWidth,
    values = [],
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
      {isEmpty(options) && emptyState ? (
        emptyState
      ) : (
        <>
          {filterControls}
          <SelectList id={listboxIdResolved} isAriaMultiselectable>
            {displayOptions.map((option, index) => {
              const { testId: optionTestId, ...restOptionProps } = option.optionProps ?? {};
              return (
                <SelectOption
                  data-testid={optionTestId}
                  id={String(option.value)} // optional: createItemId if you want stable IDs
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
