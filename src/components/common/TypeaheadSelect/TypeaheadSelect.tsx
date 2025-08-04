import {
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  type MenuToggleProps,
  Select,
  SelectList,
  SelectOption,
  type SelectProps,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { DEFAULT_NO_OPTIONS, DEFAULT_PLACEHOLDER, PLACEHOLDER_VALUES } from './constants';
import TypeaheadMenuToggle from './TypeaheadMenuToggle';
import type { TypeaheadSelectOption } from './types';
import {
  defaultFilterFunction,
  generateFilteredOptions,
  getDefaultCreateMessage,
  getDefaultNoResults,
  isPlaceholderValue,
} from './utils';

type TypeaheadSelectProps = {
  options: TypeaheadSelectOption[];
  value?: string | number;
  onChange: (value: string | number | undefined) => void;
  onInputChange?: (inputValue: string) => void;
  filterFunction?: (
    filterValue: string,
    options: TypeaheadSelectOption[],
  ) => TypeaheadSelectOption[];
  allowClear?: boolean;
  placeholder?: string;
  isCreatable?: boolean;
  createOptionMessage?: string | ((value: string) => string);
  noOptionsMessage?: string;
  noResultsMessage?: string | ((filter: string) => string);
  isDisabled?: boolean;
  toggleWidth?: string;
  toggleProps?: Omit<MenuToggleProps, 'ref' | 'onClick' | 'isExpanded'>;
  filterControls?: ReactNode;
  testId?: string;
} & Omit<SelectProps, 'toggle' | 'onSelect' | 'selected'>;

const TypeaheadSelect = (
  {
    allowClear = false,
    createOptionMessage = getDefaultCreateMessage,
    filterControls,
    filterFunction = defaultFilterFunction,
    isCreatable = false,
    isDisabled = false,
    noOptionsMessage = DEFAULT_NO_OPTIONS,
    noResultsMessage = getDefaultNoResults,
    onChange,
    onInputChange,
    options = [],
    placeholder = DEFAULT_PLACEHOLDER,
    testId,
    toggleProps,
    toggleWidth,
    value,
    ...selectProps
  }: TypeaheadSelectProps,
  ref: ForwardedRef<HTMLInputElement>,
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => inputRef.current!, []);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(
    () =>
      generateFilteredOptions({
        createOptionMessage,
        filterFunction,
        inputValue,
        isCreatable,
        isFiltering,
        noResultsMessage,
        options,
      }),
    [
      isFiltering,
      inputValue,
      options,
      filterFunction,
      isCreatable,
      createOptionMessage,
      noResultsMessage,
    ],
  );

  // Show filtered options when filtering, all options when not, or no options message
  const displayOptions = useMemo(() => {
    if (isEmpty(options)) {
      return [
        {
          content: noOptionsMessage,
          optionProps: { isDisabled: true },
          value: PLACEHOLDER_VALUES.NO_OPTIONS,
        },
      ];
    }
    return filteredOptions;
  }, [options, filteredOptions, noOptionsMessage]);

  const handleToggleClick = (): void => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (!newIsOpen) {
      // Reset filtering state when closing
      setIsFiltering(false);
      setInputValue(selectedOption?.content?.toString() ?? '');
    }
  };

  const handleInputValueChange = (newInputValue: string, newIsFiltering: boolean): void => {
    setInputValue(newInputValue);
    setIsFiltering(newIsFiltering);
  };

  const handleSelectionClear = (): void => {
    setInputValue('');
    onChange('');
  };

  const handleSelect = (selectedValue: string | number | undefined): void => {
    if (isPlaceholderValue(selectedValue)) {
      return;
    }

    // Check if this is a create action or existing option
    const existingOption = options.find((option) => option.value === selectedValue);

    if (existingOption || isCreatable) {
      onChange(selectedValue);
      setIsOpen(false);
      setIsFiltering(false);
      setInputValue(existingOption?.content?.toString() ?? selectedValue?.toString() ?? '');
    }
  };

  return (
    <Select
      isOpen={isOpen}
      onSelect={(_, selectedValue) => {
        handleSelect(selectedValue);
      }}
      onOpenChange={(open) => {
        if (!open) {
          setIsOpen(false);
        }
      }}
      toggle={(toggleRef) => (
        <TypeaheadMenuToggle
          toggleRef={toggleRef}
          inputRef={inputRef}
          placeholder={placeholder}
          isDisabled={isDisabled}
          isOpen={isOpen}
          toggleWidth={toggleWidth}
          allowClear={allowClear}
          selectedOption={selectedOption}
          isFiltering={isFiltering}
          inputValue={inputValue}
          onInputChange={onInputChange}
          onSelectionClear={handleSelectionClear}
          onToggleClick={handleToggleClick}
          onInputValueChange={handleInputValueChange}
          toggleProps={toggleProps}
          testId={testId}
        />
      )}
      shouldFocusFirstItemOnOpen={false}
      {...selectProps}
    >
      {filterControls}
      <SelectList id="typeahead-listbox">
        {displayOptions.map((option) => (
          <SelectOption key={option.value} value={option.value} {...option.optionProps}>
            {option.content}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

export default forwardRef(TypeaheadSelect);
