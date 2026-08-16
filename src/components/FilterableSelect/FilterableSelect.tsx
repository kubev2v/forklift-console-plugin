import {
  type FunctionComponent,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useMemo,
  useRef,
  useState,
} from 'react';

import FilterableSelectMenuToggle from '@components/FilterableSelect/FilterableSelectMenuToggle';
import {
  Content,
  Divider,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  type SelectOptionProps,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

/**
 * Props for the FilterableSelect component.
 */
type FilterableSelectProps = {
  /** Whether the user can create new options */
  canCreate?: boolean;
  /** Label to display for the option to create a new item */
  createNewOptionLabel?: ReactNode;
  /** Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. */
  isDisabled?: boolean;
  /** Indicates if the menu should be without the outer box-shadow */
  isPlain?: boolean;
  /** Indicates if the menu should be scrollable */
  isScrollable?: boolean;
  /** Label to display when no results are found */
  noResultFoundLabel?: ReactNode;
  /** Callback function when an option is selected */
  onSelect: (value: string | number) => void;
  /** Placeholder text for the input field */
  placeholder?: string;
  /** Array of options to display in the select dropdown */
  selectOptions: SelectOptionProps[];
  /** The currently selected value */
  value: string;
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
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  /**
   * Sets the selected item and triggers the onSelect callback.
   *
   * @param {string} newValue The value to set as selected.
   */
  const setSelected = (newValue: string) => {
    setSelectedItem(newValue);
    setFilterValue('');

    // Call the external on select hook.
    onSelect(newValue);
  };

  const selectOptions = useMemo(() => {
    if (!filterValue) {
      return initialSelectOptions;
    }

    const filteredOptions = initialSelectOptions.filter((menuItem) =>
      String(menuItem.itemId).toLowerCase().includes(filterValue.toLowerCase()),
    );

    if (isEmpty(filteredOptions)) {
      return [{ children: noResultFoundLabel, isDisabled: true }];
    }

    return filteredOptions;
  }, [filterValue, initialSelectOptions, noResultFoundLabel]);

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

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <FilterableSelectMenuToggle
      filterValue={filterValue}
      focusedItemIndex={focusedItemIndex}
      inputValue={inputValue}
      isOpen={isOpen}
      placeholder={placeholder}
      selectOptions={selectOptions}
      setFilterValue={setFilterValue}
      setFocusedItemIndex={setFocusedItemIndex}
      setInputValue={setInputValue}
      setIsOpen={setIsOpen}
      setSelectedValue={setSelected}
      toggleRef={toggleRef}
    />
  );

  return (
    // Custom select does not support the complex toggle being used here
    /* eslint-disable-next-line no-restricted-syntax */
    <Select
      aria-disabled={isDisabled}
      id="typeahead-select"
      isOpen={isOpen}
      isPlain={isPlain}
      isScrollable={isScrollable}
      onOpenChange={() => {
        setIsOpen(false);
        setFilterValue('');
        setInputValue(selectedItem);
      }}
      onSelect={onItemSelect}
      ref={menuRef}
      selected={selectedItem}
      toggle={toggle}
    >
      <SelectList>
        {selectOptions.map((option, index) => (
          <SelectOption
            className={option.className}
            isFocused={focusedItemIndex === index}
            key={String(option.itemId ?? index)}
            onClick={() => {
              setSelected(String(option.itemId ?? ''));
            }}
            {...option}
            ref={null}
          />
        ))}
        {canCreate && !selectOptions.some((option) => option.itemId === filterValue) && (
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
                <Content component="p">{createNewOptionLabel}</Content>
                <Content component="p">{`"${filterValue}"`}</Content>
              </>
            </SelectOption>
          </>
        )}
      </SelectList>
    </Select>
  );
};
