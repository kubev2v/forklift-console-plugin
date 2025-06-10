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
type Option = {
  key: number | string;
  name: string;
  description: string;
};

/**
 * @typedef SettingsSelectInputProps
 * @property {string} value - The current selected value
 * @property {(value: string) => void} onChange - Function to call when the value changes
 * @property {Option[]} options - The options to present to the user
 */
export type SettingsSelectInputProps = {
  value: number | string;
  onChange: (value: number | string) => void;
  options: Option[];
};

/**
 * SelectInput component. Provides a select input form element with predefined options.
 */
const SettingsSelectInput: FC<SettingsSelectInputProps> = ({ onChange, options, value }) => {
  // State to keep track of the dropdown menu open/closed state
  const [isOpen, setIsOpen] = useState(false);

  // Build a dictionary mapping option names to keys for efficient lookup
  // This dictionary is re-calculated every time the options prop changes
  const nameToKey = useMemo(() => {
    return options?.reduce<Record<string, string | number>>((dict, option) => {
      dict[option.name] = option.key;
      return dict;
    }, {});
  }, [options]);

  const keyToName = useMemo(() => {
    return options?.reduce<Record<string, string | number>>((dict, option) => {
      dict[option.key] = option.name;
      return dict;
    }, {});
  }, [options]);

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
    return options?.map((option) => (
      <SelectOption key={option.key} value={option.name} description={option.description}>
        {option.name}
      </SelectOption>
    ));
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
      onChange(key);

      // Toggle the dropdown menu open state
      setSelected(selectedValue as string);
      setIsOpen(false);
    },
    [nameToKey, onChange],
  );

  // Render the Select component with dynamically created SelectOption children
  return (
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
