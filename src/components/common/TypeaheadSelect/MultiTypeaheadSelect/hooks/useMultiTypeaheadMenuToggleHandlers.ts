import { type RefObject, useMemo, useState } from 'react';

import { isEmpty } from '@utils/helpers';

import type { TypeaheadSelectOption } from '../../utils/types';

type UseMultiTypeaheadMenuToggleHandlersArgs = {
  allowClear: boolean;
  inputRef: RefObject<HTMLInputElement>;
  inputValue: string;
  isDisabled: boolean;
  isFiltering: boolean;
  isOpen: boolean;
  onChipRemove: (value: string | number) => void;
  onClearAll: () => void;
  onInputChange?: (value: string) => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onInputValueChange: (value: string, isFiltering: boolean) => void;
  onToggleClick: () => void;
  selectedOptions: TypeaheadSelectOption[];
};

type UseMultiTypeaheadMenuToggleHandlersResult = {
  handleClearClick: () => void;
  handleInputChange: (event: React.FormEvent<HTMLInputElement>, newValue: string) => void;
  handleKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  handleToggleClick: () => void;
  setIsFocused: (focused: boolean) => void;
  setIsHovered: (hovered: boolean) => void;
  showClearButton: boolean;
};

export const useMultiTypeaheadMenuToggleHandlers = ({
  allowClear,
  inputRef,
  inputValue,
  isDisabled,
  isFiltering,
  isOpen,
  onChipRemove,
  onClearAll,
  onInputChange,
  onInputKeyDown,
  onInputValueChange,
  onToggleClick,
  selectedOptions,
}: UseMultiTypeaheadMenuToggleHandlersArgs): UseMultiTypeaheadMenuToggleHandlersResult => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const showClearButton = useMemo(() => {
    const hasAnySelection = !isEmpty(selectedOptions);
    const hasTypedValue = isFiltering && !isEmpty(inputValue);
    return (
      allowClear && (hasAnySelection || hasTypedValue) && (isFocused || isHovered || isFiltering)
    );
  }, [allowClear, selectedOptions, isFiltering, inputValue, isFocused, isHovered]);

  const handleToggleClick = (): void => {
    if (isDisabled) {
      return;
    }
    onToggleClick();
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>, newValue: string): void => {
    if (isDisabled) {
      return;
    }
    onInputValueChange(newValue, true);
    onInputChange?.(newValue);

    if (!isDisabled && !isOpen && !isEmpty(newValue)) {
      onToggleClick();
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    onInputKeyDown(e);
    if (e.key === 'Backspace' && !inputValue && !isEmpty(selectedOptions)) {
      e.preventDefault();
      const last = selectedOptions[selectedOptions.length - 1];
      onChipRemove(last.value);
    }
  };

  const handleClearClick = (): void => {
    onInputValueChange('', false);
    onClearAll();
    inputRef.current?.focus();
  };

  return {
    handleClearClick,
    handleInputChange,
    handleKeyDown,
    handleToggleClick,
    setIsFocused,
    setIsHovered,
    showClearButton,
  };
};
