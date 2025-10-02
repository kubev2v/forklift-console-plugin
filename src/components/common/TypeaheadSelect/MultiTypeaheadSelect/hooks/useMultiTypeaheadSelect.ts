import { type RefObject, useMemo } from 'react';

import { DEFAULT_NO_OPTIONS } from '../../utils/constants';
import type { TypeaheadSelectOption } from '../../utils/types';
import {
  defaultFilterFunction,
  getDefaultCreateMessage,
  getDefaultNoResults,
} from '../../utils/utils';

import { useMultiTypeaheadFiltering } from './useMultiTypeaheadFiltering';
import { useMultiTypeaheadInteractions } from './useMultiTypeaheadInteractions';
import { useMultiTypeaheadOpen } from './useMultiTypeaheadOpen';

type UseMultiTypeaheadArgs = {
  options: TypeaheadSelectOption[];
  values: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  onCreateOption?: (createdValue: string) => void;
  onInputChange?: (inputValue: string) => void;
  isCreatable?: boolean;
  filterFunction?: (filterValue: string, opts: TypeaheadSelectOption[]) => TypeaheadSelectOption[];
  createOptionMessage?: string | ((value: string) => string);
  noResultsMessage?: string | ((filter: string) => string);
  noOptionsMessage?: string;
  maxSelections?: number;
  listboxId?: string;
};

type UseMultiTypeaheadReturn = {
  isOpen: boolean;
  isFiltering: boolean;
  inputValue: string;
  inputRef: RefObject<HTMLInputElement>;
  selectedOptions: TypeaheadSelectOption[];
  displayOptions: TypeaheadSelectOption[];
  focusedItemIndex: number | null;
  activeItemId: string | null;
  listboxId: string;
  setIsOpen: (open: boolean) => void;
  onToggleClick: () => void;
  onInputClick: () => void;
  onInputValueChange: (newValue: string, filtering: boolean) => void;
  onInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onChipRemove: (value: string | number) => void;
  onClearAll: () => void;
  handleSelect: (selectedValue: string | number | undefined) => void;
  onOpenChange: (open: boolean) => void;
};

export const useMultiTypeaheadSelect = ({
  createOptionMessage = getDefaultCreateMessage,
  filterFunction = defaultFilterFunction,
  isCreatable = false,
  listboxId = 'select-multi-typeahead-listbox',
  maxSelections,

  noOptionsMessage = DEFAULT_NO_OPTIONS,
  noResultsMessage = getDefaultNoResults,
  onChange,
  onCreateOption,
  onInputChange,
  options,
  values,
}: UseMultiTypeaheadArgs): UseMultiTypeaheadReturn => {
  const open = useMultiTypeaheadOpen({ onInputChange });

  const filtering = useMultiTypeaheadFiltering({
    createOptionMessage,
    filterFunction,
    inputValue: open.inputValue,
    isCreatable,
    isFiltering: open.isFiltering,
    noOptionsMessage,
    noResultsMessage,
    options,
    values,
  });

  const interactions = useMultiTypeaheadInteractions({
    displayOptions: filtering.displayOptions,
    isCreatable,
    maxSelections,
    onChange,
    onCreateOption,
    options,
    values,
    ...open,
  });

  const resolvedListboxId = useMemo(() => listboxId, [listboxId]);

  return {
    ...filtering,
    ...interactions,
    ...open,
    listboxId: resolvedListboxId,
  };
};
