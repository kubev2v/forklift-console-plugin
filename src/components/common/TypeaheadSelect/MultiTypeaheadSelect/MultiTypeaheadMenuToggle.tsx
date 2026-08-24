import type { FC, Ref, RefObject } from 'react';

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

import { useMultiTypeaheadMenuToggleHandlers } from './hooks/useMultiTypeaheadMenuToggleHandlers';

type MultiTypeaheadMenuToggleProps = {
  activeItemId: string | null;
  allowClear: boolean;
  inputRef: RefObject<HTMLInputElement>;
  inputValue: string;
  isDisabled: boolean;
  isFiltering: boolean;
  isOpen: boolean;
  listboxId: string;
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

const MultiTypeaheadMenuToggle: FC<MultiTypeaheadMenuToggleProps> = (props) => {
  const {
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
  } = props;

  const handlers = useMultiTypeaheadMenuToggleHandlers({
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
  });

  return (
    <MenuToggle
      aria-label="Multi typeahead creatable menu toggle"
      data-testid={testId}
      innerRef={toggleRef}
      isDisabled={isDisabled}
      isExpanded={isOpen}
      isFullWidth
      onClick={handlers.handleToggleClick}
      onMouseEnter={() => {
        handlers.setIsHovered(true);
      }}
      onMouseLeave={() => {
        handlers.setIsHovered(false);
      }}
      style={{ width: toggleWidth }}
      variant="typeahead"
      {...toggleProps}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          autoComplete="off"
          innerRef={inputRef}
          onChange={handlers.handleInputChange}
          onClick={onInputClick}
          onKeyDown={handlers.handleKeyDown}
          placeholder={placeholder}
          value={inputValue}
          {...(activeItemId ? { 'aria-activedescendant': activeItemId } : {})}
          aria-controls={listboxId}
          isExpanded={isOpen}
          onBlur={() => {
            handlers.setIsFocused(false);
          }}
          onFocus={() => {
            handlers.setIsFocused(true);
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
          {handlers.showClearButton && (
            <Button
              aria-label="Clear selections"
              icon={<TimesIcon />}
              onClick={handlers.handleClearClick}
              variant={ButtonVariant.plain}
            />
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );
};

export default MultiTypeaheadMenuToggle;
