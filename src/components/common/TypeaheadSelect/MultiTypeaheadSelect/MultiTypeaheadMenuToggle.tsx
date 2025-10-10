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
  toggleRef: Ref<MenuToggleElement>;
  inputRef: RefObject<HTMLInputElement>;
  placeholder: string;
  isDisabled: boolean;
  isOpen: boolean;
  toggleWidth?: string;
  allowClear: boolean;
  selectedOptions: TypeaheadSelectOption[];
  isFiltering: boolean;
  inputValue: string;
  onInputChange?: (value: string) => void;
  onClearAll: () => void;
  onToggleClick: () => void;
  onInputValueChange: (value: string, isFiltering: boolean) => void;
  onChipRemove: (value: string | number) => void;
  onInputClick: () => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  activeItemId: string | null;
  toggleProps?: Omit<MenuToggleProps, 'innerRef' | 'onClick' | 'isExpanded' | 'variant'>;
  testId?: string;
  listboxId: string; // for aria-controls
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
    if (isDisabled) return;
    onToggleClick();
    if (!isOpen) setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInputChange = (event: FormEvent<HTMLInputElement>, newValue: string): void => {
    if (isDisabled) return;
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
      variant="typeahead"
      aria-label="Multi typeahead creatable menu toggle"
      onClick={handleToggleClick}
      innerRef={toggleRef}
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
      data-testid={testId}
      {...toggleProps}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onInputClick}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          innerRef={inputRef}
          placeholder={placeholder}
          {...(activeItemId ? { 'aria-activedescendant': activeItemId } : {})}
          role="combobox"
          isExpanded={isOpen}
          aria-controls={listboxId}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
        >
          <LabelGroup aria-label="Current selections">
            {selectedOptions.map((opt) => (
              <Label
                variant="outline"
                key={String(opt.value)}
                onClose={(ev) => {
                  ev.stopPropagation();
                  onChipRemove(opt.value);
                }}
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
              icon={<TimesIcon />}
              variant={ButtonVariant.plain}
              onClick={() => {
                onInputValueChange('', false);
                onClearAll();
                inputRef.current?.focus();
              }}
              aria-label="Clear selections"
            />
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );
};

export default MultiTypeaheadMenuToggle;
