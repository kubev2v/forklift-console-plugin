import { type RefObject, useMemo, useRef, useState } from 'react';

import { isEmpty } from '@utils/helpers';

import { DEFAULT_NO_OPTIONS, PLACEHOLDER_VALUES } from '../utils/constants';
import type { TypeaheadSelectOption } from '../utils/types';
import {
  defaultFilterFunction,
  generateFilteredOptions,
  getDefaultCreateMessage,
  getDefaultNoResults,
  isPlaceholderValue,
} from '../utils/utils';

export const closeSelectWhenBlurred = (
  open: boolean,
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void,
): void => {
  if (!open) {
    setIsOpen(false);
  }
};

type UseTypeaheadSelectArgs = {
  createOptionMessage?: string | ((value: string) => string);
  filterFunction?: (
    filterValue: string,
    options: TypeaheadSelectOption[],
  ) => TypeaheadSelectOption[];
  isCreatable?: boolean;
  noOptionsMessage?: string;
  noResultsMessage?: string | ((filter: string) => string);
  onChange: (value: string | number | undefined) => void;
  options: TypeaheadSelectOption[];
  value?: string | number;
};

type UseTypeaheadSelectReturn = {
  displayOptions: TypeaheadSelectOption[];
  handleFooterClick: () => void;
  handleInputValueChange: (newInputValue: string, newIsFiltering: boolean) => void;
  handleSelect: (selectedValue: string | number | undefined) => void;
  handleSelectionClear: () => void;
  handleToggleClick: () => void;
  inputRef: RefObject<HTMLInputElement>;
  inputValue: string;
  isFiltering: boolean;
  isOpen: boolean;
  selectedOption: TypeaheadSelectOption | undefined;
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
};

export const useTypeaheadSelect = ({
  createOptionMessage = getDefaultCreateMessage,
  filterFunction = defaultFilterFunction,
  isCreatable = false,
  noOptionsMessage = DEFAULT_NO_OPTIONS,
  noResultsMessage = getDefaultNoResults,
  onChange,
  options,
  value,
}: UseTypeaheadSelectArgs): UseTypeaheadSelectReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (isPlaceholderValue(selectedValue)) {
      return;
    }

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

  const handleFooterClick = (): void => {
    setIsOpen(false);
  };

  return {
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
  };
};
