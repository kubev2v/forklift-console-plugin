import { useCallback } from 'react';

import { isEmpty } from '@utils/helpers';

import type { TypeaheadSelectOption } from '../../utils/types';
import { getNextEnabledIndex, getPrevEnabledIndex } from '../utils/utils';

type UseMultiTypeaheadKeyboardNavigationArgs = {
  displayOptions: TypeaheadSelectOption[];
  focusedItemIndex: number | null;
  handleSelect: (selectedValue: string | number | undefined) => void;
  isOpen: boolean;
  setActiveAndFocusedItem: (index: number) => void;
  setIsOpen: (open: boolean) => void;
};

export const useMultiTypeaheadKeyboardNavigation = ({
  displayOptions,
  focusedItemIndex,
  handleSelect,
  isOpen,
  setActiveAndFocusedItem,
  setIsOpen,
}: UseMultiTypeaheadKeyboardNavigationArgs): ((
  event: React.KeyboardEvent<HTMLInputElement>,
) => void) =>
  useCallback(
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
