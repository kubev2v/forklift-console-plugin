import {
  type FC,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type Ref,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Button,
  KeyTypes,
  MenuToggle,
  type MenuToggleElement,
  type MenuToggleProps,
  Select,
  SelectList,
  SelectOption,
  type SelectOptionProps,
  type SelectProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import { t, useForkliftTranslation } from '@utils/i18n';

export type TypeaheadSelectOption = {
  /** Content of the select option. */
  content: string | number;
  /** Value of the select option. */
  value: string | number;
  /** Indicator for option being selected */
  isSelected?: boolean;
} & Omit<SelectOptionProps, 'content' | 'isSelected'>;

type TypeaheadSelectProps = {
  /** Options of the select */
  selectOptions: TypeaheadSelectOption[];
  /** Callback triggered on selection. */
  onSelect?: (
    _event: MouseEvent | KeyboardEvent<HTMLInputElement> | undefined,
    selection: string | number,
  ) => void;
  /** Callback triggered when the select opens or closes. */
  onToggle?: (nextIsOpen: boolean) => void;
  /** Callback triggered when the text in the input field changes. */
  onInputChange?: (newValue: string) => void;
  /** Function to return items matching the current filter value */
  filterFunction?: (
    filterValue: string,
    options: TypeaheadSelectOption[],
  ) => TypeaheadSelectOption[];
  /** Callback triggered when the clear button is selected */
  onClearSelection?: () => void;
  /** Flag to allow clear current selection */
  allowClear?: boolean;
  /** Placeholder text for the select input. */
  placeholder?: string;
  /** Flag to indicate if the typeahead select allows new items */
  isCreatable?: boolean;
  /** Flag to indicate if create option should be at top of typeahead */
  isCreateOptionOnTop?: boolean;
  /** Message to display to create a new option */
  createOptionMessage?: string | ((newValue: string) => string);
  /** Message to display when no options are available. */
  noOptionsAvailableMessage?: string;
  /** Message to display when no options match the filter. */
  noOptionsFoundMessage?: string | ((filter: string) => string);
  /** Flag indicating the select should be disabled. */
  isDisabled?: boolean;
  /** Width of the toggle. */
  toggleWidth?: string;
  /** Additional props passed to the toggle. */
  toggleProps?: MenuToggleProps;
} & Omit<SelectProps, 'toggle' | 'onSelect'>;

const defaultNoOptionsFoundMessage = (filter: string) => `No results found for "${filter}"`;
const defaultCreateOptionMessage = (newValue: string) => `Create "${newValue}"`;
const defaultFilterFunction = (filterValue: string, options: TypeaheadSelectOption[]) =>
  options.filter((option) =>
    String(option.content).toLowerCase().includes(filterValue.toLowerCase()),
  );

export const TypeaheadSelect: FC<TypeaheadSelectProps> = ({
  allowClear,
  children,
  createOptionMessage = defaultCreateOptionMessage,
  filterFunction = defaultFilterFunction,
  innerRef,
  isCreatable = false,
  isCreateOptionOnTop = false,
  isDisabled,
  noOptionsAvailableMessage = t('No options are available'),
  noOptionsFoundMessage = defaultNoOptionsFoundMessage,
  onClearSelection,
  onInputChange,
  onSelect,
  onToggle,
  placeholder = t('Select an option'),
  selectOptions,
  toggleProps,
  toggleWidth,
  ...props
}: TypeaheadSelectProps) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState<string>('');
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>();

  const NO_RESULTS = t('No results');

  const selected = useMemo(
    () => selectOptions.find((option) => option.value === props.selected || option.isSelected),
    [props.selected, selectOptions],
  );

  const filteredSelections = useMemo(() => {
    let newSelectOptions: TypeaheadSelectOption[] = selectOptions;

    // Filter menu items based on the text input value when one exists
    if (isFiltering && filterValue) {
      newSelectOptions = filterFunction(filterValue, selectOptions);

      if (
        isCreatable &&
        filterValue.trim() &&
        !newSelectOptions.find(
          (option) => String(option.content).toLowerCase() === filterValue.toLowerCase(),
        )
      ) {
        const createOption = {
          content:
            typeof createOptionMessage === 'string'
              ? createOptionMessage
              : createOptionMessage(filterValue),
          value: filterValue,
        };
        newSelectOptions = isCreateOptionOnTop
          ? [createOption, ...newSelectOptions]
          : [...newSelectOptions, createOption];
      }

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          {
            content:
              typeof noOptionsFoundMessage === 'string'
                ? noOptionsFoundMessage
                : noOptionsFoundMessage(filterValue),
            isAriaDisabled: true,
            value: NO_RESULTS,
          },
        ];
      }
    }

    // When no options are  available,  display 'No options available'
    if (!newSelectOptions.length) {
      newSelectOptions = [
        {
          content: noOptionsAvailableMessage,
          isAriaDisabled: true,
          value: NO_RESULTS,
        },
      ];
    }

    return newSelectOptions;
  }, [
    isFiltering,
    filterValue,
    filterFunction,
    selectOptions,
    noOptionsFoundMessage,
    isCreatable,
    isCreateOptionOnTop,
    createOptionMessage,
    noOptionsAvailableMessage,
  ]);

  useEffect(() => {
    if (isFiltering) {
      openMenu();
    }
    // Don't update on openMenu changes
  }, [isFiltering]);

  const setActiveAndFocusedItem = (itemIndex: number) => {
    setFocusedItemIndex(itemIndex);
    const focusedItem = selectOptions[itemIndex];
    setActiveItemId(String(focusedItem.value));
  };

  const resetActiveAndFocusedItem = () => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  };

  const openMenu = () => {
    if (!isOpen) {
      if (onToggle) {
        onToggle(true);
      }
      setIsOpen(true);
    }
  };

  const closeMenu = () => {
    if (onToggle) {
      onToggle(false);
    }
    setIsOpen(false);
    resetActiveAndFocusedItem();
    setIsFiltering(false);
    setFilterValue(String(selected?.content ?? ''));
  };

  const onInputClick = () => {
    if (!isOpen) {
      openMenu();
    }
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  };

  const selectOption = (
    _event: MouseEvent | KeyboardEvent<HTMLInputElement> | undefined,
    option: TypeaheadSelectOption,
  ) => {
    if (onSelect) {
      onSelect(_event, option.value);
    }
    closeMenu();
  };

  const handleSelect = (_event: MouseEvent | undefined, value: string | number | undefined) => {
    if (value && value !== NO_RESULTS) {
      const optionToSelect = selectOptions.find((option) => option.value === value);
      if (optionToSelect) {
        selectOption(_event, optionToSelect);
      } else if (isCreatable) {
        selectOption(_event, { content: value, value });
      }
    }
  };

  const onTextInputChange = (_event: FormEvent<HTMLInputElement>, value: string) => {
    setFilterValue(value || '');
    setIsFiltering(true);
    if (onInputChange) {
      onInputChange(value);
    }

    resetActiveAndFocusedItem();
  };

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus = 0;

    openMenu();

    if (filteredSelections.every((option) => option.isDisabled)) {
      return;
    }

    if (key === KeyTypes.ArrowUp) {
      // When no index is set or at the first index, focus to the last, otherwise decrement focus index
      if (focusedItemIndex === null || focusedItemIndex === 0) {
        indexToFocus = filteredSelections.length - 1;
      } else {
        indexToFocus = focusedItemIndex - 1;
      }

      // Skip disabled options
      while (filteredSelections[indexToFocus].isDisabled) {
        indexToFocus -= 1;
        if (indexToFocus === -1) {
          indexToFocus = filteredSelections.length - 1;
        }
      }
    }

    if (key === KeyTypes.ArrowDown) {
      // When no index is set or at the last index, focus to the first, otherwise increment focus index
      if (focusedItemIndex === null || focusedItemIndex === filteredSelections.length - 1) {
        indexToFocus = 0;
      } else {
        indexToFocus = focusedItemIndex + 1;
      }

      // Skip disabled options
      while (filteredSelections[indexToFocus].isDisabled) {
        indexToFocus += 1;
        if (indexToFocus === filteredSelections.length) {
          indexToFocus = 0;
        }
      }
    }

    setActiveAndFocusedItem(indexToFocus);
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const focusedItem = focusedItemIndex !== null ? filteredSelections[focusedItemIndex] : null;

    switch (event.key) {
      case KeyTypes.Enter:
        if (
          isOpen &&
          focusedItem &&
          focusedItem.value !== NO_RESULTS &&
          !focusedItem.isAriaDisabled
        ) {
          selectOption(event, focusedItem);
        }

        openMenu();

        break;
      case KeyTypes.ArrowUp:
      case KeyTypes.ArrowDown:
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
      default:
        break;
    }
  };

  const onToggleClick = () => {
    if (!isOpen) {
      openMenu();
    } else {
      closeMenu();
    }
    textInputRef.current?.focus();
  };

  const onClearButtonClick = () => {
    if (isFiltering && filterValue) {
      if (selected && onSelect) {
        onSelect(undefined, selected.value);
      }
      setFilterValue('');
      if (onInputChange) {
        onInputChange('');
      }
      setIsFiltering(false);
    }

    resetActiveAndFocusedItem();
    textInputRef.current?.focus();

    if (onClearSelection) {
      onClearSelection();
    }
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      aria-label="Typeahead menu toggle"
      onClick={onToggleClick}
      isExpanded={isOpen}
      isDisabled={isDisabled}
      isFullWidth
      style={{ width: toggleWidth }}
      {...toggleProps}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={isFiltering ? filterValue : (selected?.content ?? '')}
          onClick={onInputClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={placeholder}
          {...(activeItemId && { 'aria-activedescendant': activeItemId })}
          role="combobox"
          isExpanded={isOpen}
          aria-controls="select-typeahead-listbox"
        />
        {(isFiltering && filterValue) || (allowClear && selected) ? (
          <TextInputGroupUtilities>
            <Button
              icon={<TimesIcon aria-hidden />}
              variant="plain"
              onClick={onClearButtonClick}
              aria-label="Clear input value"
            />
          </TextInputGroupUtilities>
        ) : null}
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      selected={selected}
      onSelect={handleSelect}
      onOpenChange={(open) => !open && closeMenu()}
      toggle={toggle}
      shouldFocusFirstItemOnOpen={false}
      ref={innerRef}
      {...props}
    >
      {children ?? (
        <SelectList>
          {filteredSelections.map((option, index) => {
            const { content, value, ...optionProps } = option;
            return (
              <SelectOption
                key={value}
                value={value}
                isFocused={focusedItemIndex === index}
                {...optionProps}
              >
                {content}
              </SelectOption>
            );
          })}
        </SelectList>
      )}
    </Select>
  );
};
