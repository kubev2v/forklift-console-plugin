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
  createOptionMessage?: string | ((value: string) => string);
  filterFunction?: (filterValue: string, opts: TypeaheadSelectOption[]) => TypeaheadSelectOption[];
  isCreatable?: boolean;
  listboxId?: string;
  maxSelections?: number;
  noOptionsMessage?: string;
  noResultsMessage?: string | ((filter: string) => string);
  onChange: (values: (string | number)[]) => void;
  onCreateOption?: (createdValue: string) => void;
  onInputChange?: (inputValue: string) => void;
  options: TypeaheadSelectOption[];
  values: (string | number)[];
};

type UseMultiTypeaheadReturn = {
  activeItemId: string | null;
  displayOptions: TypeaheadSelectOption[];
  focusedItemIndex: number | null;
  handleSelect: (selectedValue: string | number | undefined) => void;
  inputRef: RefObject<HTMLInputElement>;
  inputValue: string;
  isFiltering: boolean;
  isOpen: boolean;
  listboxId: string;
  onChipRemove: (value: string | number) => void;
  onClearAll: () => void;
  onInputClick: () => void;
  onInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onInputValueChange: (newValue: string, filtering: boolean) => void;
  onOpenChange: (open: boolean) => void;
  onToggleClick: () => void;
  selectedOptions: TypeaheadSelectOption[];
  setIsOpen: (open: boolean) => void;
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
