import { type FC, type MouseEvent, type Ref, useCallback, useMemo, useState } from 'react';

import {
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

/**
 * @typedef Option
 * @property {number} key
 * @property {number | string} name
 * @property {string} description
 */
export type Option = {
  key: number | string;
  name: string;
  description: string;
};

/**
 * @typedef BlankOption
 * @property {string} name - The display name for the blank option
 * @property {string} [description] - Optional description for the blank option
 */
type BlankOption = {
  name: string;
  description?: string;
};

/**
 * @typedef SettingsSelectInputProps
 * @property {string} value - The current selected value
 * @property {(value: string) => void} onChange - Function to call when the value changes
 * @property {Option[]} options - The options to present to the user
 * @property {BlankOption} [blankOption] - Optional blank option that passes an empty value when selected
 */
type SettingsSelectInputProps = {
  value: number | string;
  onChange: (value: number | string) => void;
  options: Option[];
  blankOption?: BlankOption;
};

// Special key used internally to identify the blank option
const BLANK_OPTION_KEY = '__blank__';

/**
 * SelectInput component. Provides a select input form element with predefined options.
 */
const SettingsSelectInput: FC<SettingsSelectInputProps> = ({
  blankOption,
  onChange,
  options,
  value,
}) => {
  // State to keep track of the dropdown menu open/closed state
  const [isOpen, setIsOpen] = useState(false);

  // Build a dictionary mapping option names to keys for efficient lookup
  // This dictionary is re-calculated every time the options prop changes
  const nameToKey = useMemo(() => {
    const dict = options?.reduce<Record<string, string | number>>((acc, option) => {
      acc[option.name] = option.key;
      return acc;
    }, {});

    // Add blank option mapping if provided
    if (blankOption) {
      dict[blankOption.name] = BLANK_OPTION_KEY;
    }

    return dict;
  }, [options, blankOption]);

  const keyToName = useMemo(() => {
    const dict = options?.reduce<Record<string, string | number>>((acc, option) => {
      acc[option.key] = option.name;
      return acc;
    }, {});

    // Add blank option mapping if provided (empty string key maps to blank option name)
    if (blankOption) {
      dict[''] = blankOption.name;
    }

    return dict;
  }, [options, blankOption]);

  const valueLabel = keyToName?.[value] ?? value;
  const [selected, setSelected] = useState<string | number>(valueLabel);

  const onToggleClick = () => {
    setIsOpen((open) => !open);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      className="forklift-overview__settings-select"
    >
      {selected || 'Select an option'}
    </MenuToggle>
  );

  const renderOptions = () => {
    const optionElements = options?.map((option) => (
      <SelectOption key={option.key} value={option.name} description={option.description}>
        {option.name}
      </SelectOption>
    ));

    // Prepend blank option if provided
    if (blankOption) {
      return [
        <SelectOption
          key={BLANK_OPTION_KEY}
          value={blankOption.name}
          description={blankOption.description}
        >
          {blankOption.name}
        </SelectOption>,
        ...optionElements,
      ];
    }

    return optionElements;
  };

  // Callback function to handle selection in the dropdown menu
  const onSelect = useCallback(
    (_event?: MouseEvent, selectedValue?: string | number) => {
      if (selectedValue === undefined) {
        setIsOpen(false);
        return;
      }
      // Use the dictionary to find the key corresponding to the selected name
      const key = nameToKey[selectedValue] || selectedValue;

      // If blank option was selected, pass empty string to onChange
      if (key === BLANK_OPTION_KEY) {
        onChange('');
      } else {
        onChange(key);
      }

      // Toggle the dropdown menu open state
      setSelected(selectedValue as string);
      setIsOpen(false);
    },
    [nameToKey, onChange],
  );

  // Render the Select component with dynamically created SelectOption children
  return (
    // Custom select does not support the complex toggle being used here
    // eslint-disable-next-line no-restricted-syntax
    <Select
      role="menu"
      aria-label="Select Input with descriptions"
      aria-labelledby="exampleSelect"
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={(nextOpen: boolean) => {
        setIsOpen(nextOpen);
      }}
      toggle={toggle}
      shouldFocusToggleOnSelect
      shouldFocusFirstItemOnOpen={false}
      popperProps={{
        direction: 'down',
        enableFlip: true,
      }}
    >
      <SelectList>{renderOptions()}</SelectList>
    </Select>
  );
};

export default SettingsSelectInput;
