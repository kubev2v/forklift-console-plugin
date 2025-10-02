import { useCallback, useRef, useState } from 'react';

type UseMultiTypeaheadOpenArgs = {
  onInputChange?: (inputValue: string) => void;
};

type UseMultiTypeaheadOpenReturn = {
  isOpen: boolean;
  isFiltering: boolean;
  inputValue: string;
  inputRef: React.RefObject<HTMLInputElement>;
  setIsOpen: (open: boolean) => void;
  resetFilter: () => void;
  onToggleClick: () => void;
  onInputClick: () => void;
  onInputValueChange: (newValue: string, filtering: boolean) => void;
  onOpenChange: (open: boolean) => void;
};

export const useMultiTypeaheadOpen = ({
  onInputChange,
}: UseMultiTypeaheadOpenArgs): UseMultiTypeaheadOpenReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const resetFilter = useCallback(() => {
    setIsFiltering(false);
    setInputValue('');
  }, []);

  const onToggleClick = useCallback(() => {
    setIsOpen((prev) => !prev);
    inputRef.current?.focus();
  }, []);

  const onInputClick = useCallback(() => {
    if (!isOpen) setIsOpen(true);
    else if (!inputValue) setIsOpen(false);
  }, [inputValue, isOpen]);

  const onInputValueChange = useCallback(
    (newValue: string, filtering: boolean) => {
      setInputValue(newValue);
      setIsFiltering(filtering);
      onInputChange?.(newValue);
    },
    [onInputChange],
  );

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
        resetFilter();
      }
    },
    [resetFilter],
  );

  return {
    inputRef,
    inputValue,
    isFiltering,
    isOpen,
    onInputClick,
    onInputValueChange,
    onOpenChange,
    onToggleClick,
    resetFilter,
    setIsOpen,
  };
};
