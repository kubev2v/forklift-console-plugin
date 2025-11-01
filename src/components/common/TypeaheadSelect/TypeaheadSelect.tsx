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
  MenuFooter,
  type MenuToggleProps,
  Select,
  SelectList,
  SelectOption,
  type SelectProps,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { DEFAULT_NO_OPTIONS, DEFAULT_PLACEHOLDER, PLACEHOLDER_VALUES } from './utils/constants';
import type { TypeaheadSelectOption } from './utils/types';
import {
  defaultFilterFunction,
  generateFilteredOptions,
  getDefaultCreateMessage,
  getDefaultNoResults,
  isPlaceholderValue,
} from './utils/utils';
import TypeaheadMenuToggle from './TypeaheadMenuToggle';

import './TypeaheadSelect.scss';

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
  emptyState?: ReactNode;
  noResultsMessage?: string | ((filter: string) => string);
  footer?: ReactNode;
  isDisabled?: boolean;
  toggleWidth?: string;
  toggleProps?: Omit<MenuToggleProps, 'ref' | 'onClick' | 'isExpanded'>;
  filterControls?: ReactNode;
  testId?: string;
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

  const handleSelect = (selectedValue: string | number | undefined): void => {
    if (isPlaceholderValue(selectedValue)) return;

    const existingOption = options.find((option) => option.value === selectedValue);
    if (existingOption || isCreatable) {
      onChange(selectedValue);
      setIsOpen(false);
      setIsFiltering(false);
      setInputValue(existingOption?.content?.toString() ?? selectedValue?.toString() ?? '');
    }
  };

  const handleSelectionClear = (): void => {
    setInputValue('');
    onChange('');
  };

  const handleToggleClick = (): void => {
    if (isOpen) {
      setIsFiltering(false);
      setInputValue(selectedOption?.content?.toString() ?? '');
    }
    setIsOpen((prev) => !prev);
  };

  const handleInputValueChange = (newInputValue: string, newIsFiltering: boolean): void => {
    setInputValue(newInputValue);
    setIsFiltering(newIsFiltering);
  };

  const handleOpenChange = (open: boolean): void => {
    if (!open) setIsOpen(false);
  };

  const handleFooterClick = (): void => {
    setIsOpen(false);
  };

  return (
    <Select
      isOpen={isOpen}
      onSelect={(_, selectedValue) => {
        handleSelect(selectedValue);
      }}
      onOpenChange={handleOpenChange}
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
      {isEmpty(options) && emptyState ? (
        emptyState
      ) : (
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
            <MenuFooter className="pf-v6-u-pt-sm" onClick={handleFooterClick}>
              {footer}
            </MenuFooter>
          )}
        </>
      )}
    </Select>
  );
};

export default forwardRef(TypeaheadSelect);
