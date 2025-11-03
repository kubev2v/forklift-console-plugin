import {
  type FormEvent,
  type FunctionComponent,
  type KeyboardEventHandler,
  type Ref,
  useRef,
} from 'react';

import {
  Button,
  ButtonVariant,
  MenuToggle,
  type MenuToggleElement,
  type SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

/**
 * Props for the FilterableSelect component.
 */
type FilterableSelectMenuToggleProps = {
  toggleRef: Ref<MenuToggleElement>;
  placeholder?: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  selectOptions: SelectOptionProps[];
  inputValue: string;
  setInputValue: (value: string) => void;
  setSelectedValue: (value: string) => void;
  filterValue: string;
  setFilterValue: (value: string) => void;
  focusedItemIndex: number | null;
  setFocusedItemIndex: (value: number | null) => void;
};

const FilterableSelectMenuToggle: FunctionComponent<FilterableSelectMenuToggleProps> = ({
  filterValue,
  focusedItemIndex,
  inputValue,
  isOpen,
  placeholder,
  selectOptions,
  setFilterValue,
  setFocusedItemIndex,
  setInputValue,
  setIsOpen,
  setSelectedValue,
  toggleRef,
}) => {
  const textInputRef = useRef<HTMLInputElement>();

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onTextInputChange: (event: FormEvent<HTMLInputElement>, value: string) => void = (
    _event,
    value,
  ) => {
    setInputValue(value);
    setFilterValue(value);
  };

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus = null;

    if (isOpen) {
      if (key === 'ArrowUp') {
        // When no index is set or at the first index, focus to the last, otherwise decrement focus index
        if (focusedItemIndex === null || focusedItemIndex === 0) {
          indexToFocus = selectOptions.length - 1;
        } else {
          indexToFocus = focusedItemIndex - 1;
        }
      }

      if (key === 'ArrowDown') {
        // When no index is set or at the last index, focus to the first, otherwise increment focus index
        if (focusedItemIndex === null || focusedItemIndex === selectOptions.length - 1) {
          indexToFocus = 0;
        } else {
          indexToFocus = focusedItemIndex + 1;
        }
      }

      setFocusedItemIndex(indexToFocus);
    }
  };

  const onInputKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    const enabledMenuItems = selectOptions.filter((menuItem) => !menuItem.isDisabled);
    const [firstMenuItem] = enabledMenuItems;
    const focusedItem = focusedItemIndex ? enabledMenuItems[focusedItemIndex] : firstMenuItem;

    switch (event.key) {
      // Select the first available option
      case 'Enter':
        event.preventDefault();

        if (isOpen) {
          setInputValue(String(focusedItem?.itemId ?? filterValue));
          setSelectedValue(String(focusedItem?.itemId ?? filterValue));
        }

        setIsOpen(!isOpen);
        setFocusedItemIndex(null);

        break;
      case 'Tab':
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        handleMenuArrowKeys(event.key);
        break;
      default:
        if (!isOpen) {
          setIsOpen(true);
        }
    }
  };

  /**
   * Renders the toggle component for the dropdown.
   *
   * @param {Ref<any>} toggleRef The reference to the toggle component.
   * @returns {JSX.Element} The rendered toggle component.
   */
  return (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          spellCheck="false"
          value={inputValue}
          onClick={onToggleClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id="typeahead-select-input"
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={placeholder}
        />

        <TextInputGroupUtilities>
          {Boolean(inputValue) && (
            <Button
              icon={<TimesIcon aria-hidden />}
              variant={ButtonVariant.plain}
              onClick={() => {
                setSelectedValue('');
                setInputValue('');
                setFilterValue('');
              }}
              aria-label="Clear input value"
            />
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );
};

export default FilterableSelectMenuToggle;
