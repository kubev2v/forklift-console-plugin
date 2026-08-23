import {
  type ForwardedRef,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useImperativeHandle,
} from 'react';

import { type MenuToggleProps, Select, type SelectProps } from '@patternfly/react-core';

import { closeSelectWhenBlurred, useTypeaheadSelect } from './hooks/useTypeaheadSelect';
import { DEFAULT_PLACEHOLDER } from './utils/constants';
import type { TypeaheadSelectOption } from './utils/types';
import { defaultFilterFunction, getDefaultCreateMessage, getDefaultNoResults } from './utils/utils';
import TypeaheadMenuToggle from './TypeaheadMenuToggle';
import TypeaheadSelectOptions from './TypeaheadSelectOptions';

import './TypeaheadSelect.scss';

type TypeaheadSelectProps = {
  allowClear?: boolean;
  createOptionMessage?: string | ((value: string) => string);
  emptyState?: ReactNode;
  filterControls?: ReactNode;
  filterFunction?: (
    filterValue: string,
    options: TypeaheadSelectOption[],
  ) => TypeaheadSelectOption[];
  footer?: ReactNode;
  isCreatable?: boolean;
  isDisabled?: boolean;
  noOptionsMessage?: string;
  noResultsMessage?: string | ((filter: string) => string);
  onChange: (value: string | number | undefined) => void;
  onInputChange?: (inputValue: string) => void;
  options: TypeaheadSelectOption[];
  placeholder?: string;
  testId?: string;
  toggleProps?: Omit<MenuToggleProps, 'ref' | 'onClick' | 'isExpanded'>;
  toggleWidth?: string;
  value?: string | number;
} & Omit<SelectProps, 'toggle' | 'onSelect' | 'selected' | 'onChange'>;

const TypeaheadSelect = (
  {
    allowClear = false,
    createOptionMessage = getDefaultCreateMessage,
    emptyState,
    filterControls,
    filterFunction = defaultFilterFunction,
    footer,
    isCreatable = false,
    isDisabled = false,
    noOptionsMessage,
    noResultsMessage = getDefaultNoResults,
    onChange,
    onInputChange,
    options,
    placeholder = DEFAULT_PLACEHOLDER,
    testId,
    toggleProps,
    toggleWidth,
    value,
    ...selectProps
  }: TypeaheadSelectProps,
  ref: ForwardedRef<HTMLInputElement>,
): ReactElement => {
  const {
    displayOptions,
    handleFooterClick,
    handleInputValueChange,
    handleSelect,
    handleSelectionClear,
    handleToggleClick,
    inputRef,
    inputValue,
    isFiltering,
    isOpen,
    selectedOption,
    setIsOpen,
  } = useTypeaheadSelect({
    createOptionMessage,
    filterFunction,
    isCreatable,
    noOptionsMessage,
    noResultsMessage,
    onChange,
    options,
    value,
  });

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, [inputRef]);

  return (
    <Select
      isOpen={isOpen}
      onOpenChange={(open) => {
        closeSelectWhenBlurred(open, setIsOpen);
      }}
      onSelect={(_, selectedValue: string | number | undefined) => {
        handleSelect(selectedValue);
      }}
      shouldFocusFirstItemOnOpen={false}
      toggle={(toggleRef) => (
        <TypeaheadMenuToggle
          allowClear={allowClear}
          inputRef={inputRef}
          inputValue={inputValue}
          isDisabled={isDisabled}
          isFiltering={isFiltering}
          isOpen={isOpen}
          onInputChange={onInputChange}
          onInputValueChange={handleInputValueChange}
          onSelectionClear={handleSelectionClear}
          onToggleClick={handleToggleClick}
          placeholder={placeholder}
          selectedOption={selectedOption}
          testId={testId}
          toggleProps={toggleProps}
          toggleRef={toggleRef}
          toggleWidth={toggleWidth}
        />
      )}
      {...selectProps}
    >
      <TypeaheadSelectOptions
        displayOptions={displayOptions}
        emptyState={emptyState}
        filterControls={filterControls}
        footer={footer}
        onFooterClick={handleFooterClick}
        options={options}
      />
    </Select>
  );
};

export default forwardRef(TypeaheadSelect);
