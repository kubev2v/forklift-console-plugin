import { type FC, type FormEvent, useEffect, useState } from 'react';

import {
  Button,
  MenuToggle,
  type MenuToggleElement,
  type MenuToggleProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import type { TypeaheadSelectOption } from './types';

type TypeaheadMenuToggleProps = {
  toggleRef: React.Ref<MenuToggleElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  placeholder: string;
  isDisabled: boolean;
  isOpen: boolean;
  toggleWidth?: string;
  allowClear: boolean;
  selectedOption?: TypeaheadSelectOption;
  isFiltering: boolean;
  inputValue: string;
  onInputChange?: (value: string) => void;
  onSelectionClear: () => void;
  onToggleClick: () => void;
  onInputValueChange: (value: string, isFiltering: boolean) => void;
  toggleProps?: Omit<MenuToggleProps, 'ref' | 'onClick' | 'isExpanded'>;
};

const TypeaheadMenuToggle: FC<TypeaheadMenuToggleProps> = ({
  allowClear,
  inputRef,
  inputValue,
  isDisabled,
  isFiltering,
  isOpen,
  onInputChange,
  onInputValueChange,
  onSelectionClear,
  onToggleClick,
  placeholder,
  selectedOption,
  toggleProps,
  toggleRef,
  toggleWidth,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Update input value when selected option changes (only when not filtering)
  useEffect(() => {
    if (!isFiltering) {
      const newValue = selectedOption?.content?.toString() ?? '';
      if (newValue !== inputValue) {
        onInputValueChange(newValue, false);
      }
    }
  }, [selectedOption, isFiltering, inputValue, onInputValueChange]);

  const handleToggleClick = (): void => {
    if (isDisabled) return;
    onToggleClick();

    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleInputChange = (event: FormEvent<HTMLInputElement>, newValue: string): void => {
    onInputValueChange(newValue, true);
    onInputChange?.(newValue);

    // If user clears input, clear the selection
    if (newValue === '' && selectedOption) {
      onSelectionClear();
    }

    // Open dropdown when user starts typing
    if (!isOpen && newValue.length > 0) {
      onToggleClick();
    }
  };

  const handleClear = (): void => {
    onInputValueChange('', false);
    onSelectionClear();
    inputRef.current?.focus();
  };

  const handleInputClick = (): void => {
    if (!isOpen && !isDisabled) {
      onToggleClick();
    }
  };

  // Show clear button when there's a value to clear AND (focused, hovered, or actively filtering)
  const hasValueToClear = selectedOption ?? (isFiltering && inputValue);
  const showClearButton = allowClear && hasValueToClear && (isFocused || isHovered || isFiltering);

  return (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={handleToggleClick}
      isExpanded={isOpen}
      isDisabled={isDisabled}
      isFullWidth
      style={{ width: toggleWidth }}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      {...toggleProps}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={handleInputClick}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
          autoComplete="off"
          ref={inputRef}
          placeholder={placeholder}
          role="combobox"
          isExpanded={isOpen}
          aria-controls="typeahead-listbox"
        />
        {showClearButton && (
          <TextInputGroupUtilities>
            <Button
              icon={<TimesIcon />}
              variant="plain"
              onClick={handleClear}
              aria-label="Clear selection"
            />
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
  );
};

export default TypeaheadMenuToggle;
