import { type FC, type FormEvent, type Ref, type RefObject, useMemo, useState } from 'react';

import {
  Button,
  ButtonVariant,
  Label,
  LabelGroup,
  MenuToggle,
  type MenuToggleElement,
  type MenuToggleProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';

import type { TypeaheadSelectOption } from '../utils/types';

type MultiTypeaheadMenuToggleProps = {
  activeItemId: string | null;
  allowClear: boolean;
  inputRef: RefObject<HTMLInputElement>;
  inputValue: string;
  isDisabled: boolean;
  isFiltering: boolean;
  isOpen: boolean;
  listboxId: string; // for aria-controls
  onChipRemove: (value: string | number) => void;
  onClearAll: () => void;
  onInputChange?: (value: string) => void;
  onInputClick: () => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onInputValueChange: (value: string, isFiltering: boolean) => void;
  onToggleClick: () => void;
  placeholder: string;
  selectedOptions: TypeaheadSelectOption[];
  testId?: string;
  toggleProps?: Omit<MenuToggleProps, 'innerRef' | 'onClick' | 'isExpanded' | 'variant'>;
  toggleRef: Ref<MenuToggleElement>;
  toggleWidth?: string;
};

const MultiTypeaheadMenuToggle: FC<MultiTypeaheadMenuToggleProps> = ({
  activeItemId,
  allowClear,
  inputRef,
  inputValue,
  isDisabled,
  isFiltering,
  isOpen,
  listboxId,
  onChipRemove,
  onClearAll,
  onInputChange,
  onInputClick,
  onInputKeyDown,
  onInputValueChange,
  onToggleClick,
  placeholder,
  selectedOptions,
  testId,
  toggleProps,
  toggleRef,
  toggleWidth,
}) => {
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

  const handleInputChange = (event: FormEvent<HTMLInputElement>, newValue: string): void => {
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
    // Backspace removes last chip when input is empty
    if (e.key === 'Backspace' && !inputValue && !isEmpty(selectedOptions)) {
      e.preventDefault();
      const last = selectedOptions[selectedOptions.length - 1];
      onChipRemove(last.value);
    }
  };

  return (
    <MenuToggle
      aria-label="Multi typeahead creatable menu toggle"
      data-testid={testId}
      innerRef={toggleRef}
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
      style={{ width: toggleWidth }}
      variant="typeahead"
      {...toggleProps}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          autoComplete="off"
          innerRef={inputRef}
          onChange={handleInputChange}
          onClick={onInputClick}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          value={inputValue}
          {...(activeItemId ? { 'aria-activedescendant': activeItemId } : {})}
          aria-controls={listboxId}
          isExpanded={isOpen}
          onBlur={() => {
            setIsFocused(false);
          }}
          onFocus={() => {
            setIsFocused(true);
          }}
          role="combobox"
        >
          <LabelGroup aria-label="Current selections">
            {selectedOptions.map((opt) => (
              <Label
                key={String(opt.value)}
                onClose={(ev) => {
                  ev.stopPropagation();
                  onChipRemove(opt.value);
                }}
                variant="outline"
              >
                {opt.content}
              </Label>
            ))}
          </LabelGroup>
        </TextInputGroupMain>

        <TextInputGroupUtilities
          {...(isEmpty(selectedOptions) ? { style: { display: 'none' } } : {})}
        >
          {showClearButton && (
            <Button
              aria-label="Clear selections"
              icon={<TimesIcon />}
              onClick={() => {
                onInputValueChange('', false);
                onClearAll();
                inputRef.current?.focus();
              }}
              variant={ButtonVariant.plain}
            />
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );
};

export default MultiTypeaheadMenuToggle;
