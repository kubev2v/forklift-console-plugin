import {
  type FormEvent,
  type FunctionComponent,
  type KeyboardEventHandler,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Button,
  Divider,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  type SelectOptionProps,
  Text,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

/**
 * Props for the FilterableSelect component.
 */
type FilterableSelectProps = {
  /** Array of options to display in the select dropdown */
  selectOptions: SelectOptionProps[];
  /** The currently selected value */
  value: string;
  /** Callback function when an option is selected */
  onSelect: (value: string | number) => void;
  /** Whether the user can create new options */
  canCreate?: boolean;
  /** Placeholder text for the input field */
  placeholder?: string;
  /** Label to display when no results are found */
  noResultFoundLabel?: ReactNode;
  /** Label to display for the option to create a new item */
  createNewOptionLabel?: ReactNode;
  /** Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. */
  isDisabled?: boolean;
  /** Indicates if the menu should be without the outer box-shadow */
  isPlain?: boolean;
  /** Indicates if the menu should be scrollable */
  isScrollable?: boolean;
};

/**
 * A filterable select component that allows users to select from a list of options,
 * with the ability to filter the options and create new ones if `canCreate` is enabled.
 *
 * @param {FilterableSelectProps} props The props for the FilterableSelect component.
 * @returns {JSX.Element} The rendered FilterableSelect component.
 */
export const FilterableSelect: FunctionComponent<FilterableSelectProps> = ({
  canCreate,
  createNewOptionLabel = 'Create new option:',
  isDisabled = false,
  isPlain = false,
  isScrollable = false,
  noResultFoundLabel = 'No results found',
  onSelect,
  placeholder = 'Select item',
  selectOptions: initialSelectOptions,
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>(value);
  /**
   * inputValue: The current value displayed in the input field.
   * This is the value the user types in.
   */
  const [inputValue, setInputValue] = useState<string>(value);
  /**
   * filterValue: The value used to filter the options.
   * This is typically synchronized with inputValue, but they can be different if needed.
   */
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState<SelectOptionProps[]>(initialSelectOptions);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>();

  /**
   * Sets the selected item and triggers the onSelect callback.
   *
   * @param {string} value The value to set as selected.
   */
  const setSelected = (value: string) => {
    setSelectedItem(value);
    setFilterValue('');

    // Call the external on select hook.
    onSelect(value);
  };

  /**
   * Updates the select options based on the filter value.
   */
  useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = initialSelectOptions;

    // Filter menu items based on the text input value when one exists
    if (filterValue) {
      newSelectOptions = initialSelectOptions.filter((menuItem) =>
        String(menuItem.itemId).toLowerCase().includes(filterValue.toLowerCase()),
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [{ children: noResultFoundLabel, isDisabled: true }];
      }
    }

    setSelectOptions(newSelectOptions);
  }, [filterValue, initialSelectOptions, noResultFoundLabel]);

  /**
   * Toggles the open state of the select dropdown.
   */
  const onToggleClick = () => {
    setIsOpen((isOpen) => !isOpen);
  };

  /**
   * Handles item selection from the dropdown.
   *
   * @param {MouseEvent<Element, MouseEvent> | undefined} _event The click event.
   * @param {string | number | undefined} itemId The id of the selected item.
   */
  const onItemSelect = (_event: MouseEvent | undefined, itemId: string | number | undefined) => {
    if (itemId !== undefined) {
      setInputValue(itemId as string);
      setFilterValue(itemId as string);
      setSelected(itemId as string);
    }
    setIsOpen(false);
    setFocusedItemIndex(null);
  };

  /**
   * Handles changes in the text input.
   *
   * @param {FormEvent<HTMLInputElement>} _event The input event.
   * @param {string} value The new input value.
   */
  const onTextInputChange: (event: FormEvent<HTMLInputElement>, value: string) => void = (
    _event,
    value,
  ) => {
    setInputValue(value);
    setFilterValue(value);
  };

  /**
   * Handles arrow key navigation within the dropdown.
   *
   * @param {string} key The key pressed.
   */
  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus;

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

  /**
   * Handles keydown events in the text input.
   *
   * @param {KeyboardEventHandler<HTMLDivElement>} event The keyboard event.
   */
  const onInputKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    const enabledMenuItems = selectOptions.filter((menuItem) => !menuItem.isDisabled);
    const [firstMenuItem] = enabledMenuItems;
    const focusedItem = focusedItemIndex ? enabledMenuItems[focusedItemIndex] : firstMenuItem;

    switch (event.key) {
      // Select the first available option
      case 'Enter':
        event.preventDefault();

        if (isOpen) {
          setInputValue(String(focusedItem?.itemId || filterValue));
          setSelected(String(focusedItem?.itemId || filterValue));
        }

        setIsOpen((prevIsOpen) => !prevIsOpen);
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
        !isOpen && setIsOpen(true);
    }
  };

  /**
   * Renders the toggle component for the dropdown.
   *
   * @param {Ref<any>} toggleRef The reference to the toggle component.
   * @returns {JSX.Element} The rendered toggle component.
   */
  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
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
              variant="plain"
              onClick={() => {
                setSelected('');
                setInputValue('');
                setFilterValue('');
              }}
              aria-label="Clear input value"
            >
              <TimesIcon aria-hidden />
            </Button>
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      id="typeahead-select"
      ref={menuRef}
      isOpen={isOpen}
      selected={selectedItem}
      onSelect={onItemSelect}
      onOpenChange={() => {
        setIsOpen(false);
        setFilterValue('');
        setInputValue(selectedItem);
      }}
      toggle={toggle}
      aria-disabled={isDisabled}
      isPlain={isPlain}
      isScrollable={isScrollable}
    >
      <SelectList>
        {selectOptions.map((option, index) => (
          <SelectOption
            key={option.itemId}
            isFocused={focusedItemIndex === index}
            className={option.className}
            onClick={() => {
              setSelected(option.itemId);
            }}
            {...option}
            ref={null}
          />
        ))}
        {canCreate && !selectOptions.find((option) => option.itemId === filterValue) && (
          <>
            <Divider />
            <SelectOption
              itemId={filterValue}
              key={filterValue}
              onClick={() => {
                setSelected(filterValue);
              }}
              ref={null}
            >
              <>
                <Text>{createNewOptionLabel}</Text>
                <Text>{`"${filterValue}"`}</Text>
              </>
            </SelectOption>
          </>
        )}
      </SelectList>
    </Select>
  );
};
