import { type RefObject, useCallback, useState } from 'react';

import { isEmpty } from '@utils/helpers';

import type { TypeaheadSelectOption } from '../../utils/types';
import { isPlaceholderValue } from '../../utils/utils';
import { createItemElementId, getNextEnabledIndex, getPrevEnabledIndex } from '../utils/utils';

type UseMultiTypeaheadInteractionsArgs = {
  displayOptions: TypeaheadSelectOption[];
  inputRef: RefObject<HTMLInputElement>;
  isCreatable?: boolean;
  isOpen: boolean;
  maxSelections?: number;
  onChange: (nextValues: (string | number)[]) => void;
  onCreateOption?: (createdValue: string) => void;
  options: TypeaheadSelectOption[];
  resetFilter: () => void;
  setIsOpen: (open: boolean) => void;
  values: (string | number)[];
};

type UseMultiTypeaheadInteractionsReturn = {
  activeItemId: string | null;
  focusedItemIndex: number | null;
  handleSelect: (selectedValue: string | number | undefined) => void;
  onChipRemove: (value: string | number) => void;
  onClearAll: () => void;
  onInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  resetFocus: () => void;
  setActiveAndFocusedItem: (index: number) => void;
  toggleSelectValue: (value: string | number) => void;
};

export const useMultiTypeaheadInteractions = ({
  displayOptions,
  inputRef,
  isCreatable = false,
  isOpen,
  maxSelections,
  onChange,
  onCreateOption,
  options,
  resetFilter,
  setIsOpen,
  values,
}: UseMultiTypeaheadInteractionsArgs): UseMultiTypeaheadInteractionsReturn => {
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const resetFocus = useCallback(() => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  }, []);

  const setActiveAndFocusedItem = useCallback(
    (index: number) => {
      setFocusedItemIndex(index);
      const focusedOption = displayOptions[index];
      setActiveItemId(createItemElementId(focusedOption.value));
    },
    [displayOptions],
  );

  const toggleSelectValue = useCallback(
    (value: string | number) => {
      const alreadySelected = values.includes(value);
      const nextValues = alreadySelected
        ? values.filter((existing) => existing !== value)
        : [...values, value];

      if (
        !alreadySelected &&
        typeof maxSelections === 'number' &&
        nextValues.length > maxSelections
      ) {
        return;
      }
      onChange(nextValues);
    },
    [maxSelections, onChange, values],
  );

  const handleSelect = useCallback(
    (selectedValue: string | number | undefined) => {
      if (isPlaceholderValue(selectedValue) || selectedValue === undefined) {
        return;
      }

      const existsInOptions = options.some((opt) => opt.value === selectedValue);
      const isCreatePick = !existsInOptions && isCreatable;

      if (isCreatePick && typeof selectedValue === 'string') {
        onCreateOption?.(selectedValue);
      }

      toggleSelectValue(selectedValue);
      resetFilter();
      resetFocus();
      inputRef.current?.focus();
    },
    [inputRef, isCreatable, onCreateOption, options, resetFilter, resetFocus, toggleSelectValue],
  );

  const onInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const currentFocused = focusedItemIndex === null ? null : displayOptions[focusedItemIndex];

      switch (event.key) {
        case 'Enter': {
          if (isOpen && currentFocused && !currentFocused.optionProps?.isAriaDisabled) {
            handleSelect(currentFocused.value);
          }
          if (!isOpen) {
            setIsOpen(true);
          }
          return;
        }
        case 'ArrowUp': {
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          }
          if (isEmpty(displayOptions)) {
            return;
          }

          const startIndex =
            focusedItemIndex === null ? displayOptions.length - 1 : focusedItemIndex - 1;
          const nextIndex = getPrevEnabledIndex(displayOptions, startIndex);
          setActiveAndFocusedItem(nextIndex);
          return;
        }
        case 'ArrowDown': {
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          }
          if (isEmpty(displayOptions)) {
            return;
          }

          const startIndex = focusedItemIndex === null ? 0 : focusedItemIndex + 1;
          const nextIndex = getNextEnabledIndex(displayOptions, startIndex);
          setActiveAndFocusedItem(nextIndex);
          break;
        }
        default:
      }
    },
    [displayOptions, focusedItemIndex, handleSelect, isOpen, setActiveAndFocusedItem, setIsOpen],
  );

  const onChipRemove = useCallback(
    (value: string | number) => {
      onChange(values.filter((existing) => existing !== value));
    },
    [onChange, values],
  );

  const onClearAll = useCallback(() => {
    onChange([]);
    resetFocus();
  }, [onChange, resetFocus]);

  return {
    activeItemId,
    focusedItemIndex,
    handleSelect,
    onChipRemove,
    onClearAll,
    onInputKeyDown,
    resetFocus,
    setActiveAndFocusedItem,
    toggleSelectValue,
  };
};
