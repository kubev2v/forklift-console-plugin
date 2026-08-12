import { type FC, type FormEvent, type Ref, type RefObject, useState } from 'react';

import {
  Button,
  ButtonVariant,
  MenuToggle,
  type MenuToggleElement,
  type MenuToggleProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import type { TypeaheadSelectOption } from './utils/types';

type TypeaheadMenuToggleProps = {
  allowClear: boolean;
  inputRef: RefObject<HTMLInputElement>;
  inputValue: string;
  isDisabled: boolean;
  isFiltering: boolean;
  isOpen: boolean;
  onInputChange?: (value: string) => void;
  onInputValueChange: (value: string, isFiltering: boolean) => void;
  onSelectionClear: () => void;
  onToggleClick: () => void;
  placeholder: string;
  selectedOption?: TypeaheadSelectOption;
  testId?: string;
  toggleProps?: Omit<MenuToggleProps, 'ref' | 'onClick' | 'isExpanded'>;
  toggleRef: Ref<MenuToggleElement>;
  toggleWidth?: string;
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
  testId,
  toggleProps,
  toggleRef,
  toggleWidth,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Derive the display value: use input value when filtering, selected option content when not
  const displayValue = isFiltering ? inputValue : (selectedOption?.content?.toString() ?? '');

  const handleToggleClick = (): void => {
    if (isDisabled) {
      return;
    }
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
      data-testid={testId}
      isDisabled={isDisabled}
      isExpanded={isOpen}
      isFullWidth
      onClick={handleToggleClick}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      ref={toggleRef}
      style={{ width: toggleWidth }}
      variant="typeahead"
      {...toggleProps}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          aria-controls="typeahead-listbox"
          autoComplete="off"
          isExpanded={isOpen}
          onBlur={() => {
            setIsFocused(false);
          }}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onFocus={() => {
            setIsFocused(true);
          }}
          placeholder={placeholder}
          ref={inputRef}
          role="combobox"
          value={displayValue}
        />
        {showClearButton && (
          <TextInputGroupUtilities>
            <Button
              aria-label="Clear selection"
              icon={<TimesIcon />}
              onClick={handleClear}
              variant={ButtonVariant.plain}
            />
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
  );
};

export default TypeaheadMenuToggle;
