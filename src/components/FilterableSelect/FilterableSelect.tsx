import {
  type FunctionComponent,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useEffect,
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
      if (isEmpty(newSelectOptions)) {
        newSelectOptions = [{ children: noResultFoundLabel, isDisabled: true }];
      }
    }

    setSelectOptions(newSelectOptions);
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
      toggleRef={toggleRef}
      placeholder={placeholder}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      selectOptions={selectOptions}
      inputValue={inputValue}
      setInputValue={setInputValue}
      setSelectedValue={setSelected}
      filterValue={filterValue}
      setFilterValue={setFilterValue}
      focusedItemIndex={focusedItemIndex}
      setFocusedItemIndex={setFocusedItemIndex}
    />
  );

  return (
    // Custom select does not support the complex toggle being used here
    /* eslint-disable-next-line no-restricted-syntax */
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
              setSelected(String(option.itemId));
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
