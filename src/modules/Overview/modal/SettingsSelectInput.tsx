import React, {
  FC,
  MouseEvent as ReactMouseEvent,
  Ref,
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  MenuToggle,
  MenuToggleElement,
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
interface Option {
  key: number | string;
  name: number | string;
  description: string;
}

/**
 * @typedef SettingsSelectInputProps
 * @property {string} value - The current selected value
 * @property {(value: string) => void} onChange - Function to call when the value changes
 * @property {Option[]} options - The options to present to the user
 */
export interface SettingsSelectInputProps {
  value: number | string;
  onChange: (value: number | string) => void;
  options?: Option[];
}

/**
 * SelectInput component. Provides a select input form element with predefined options.
 *
 * @param {ModalInputComponentProps} props - Properties passed to the component
 * @returns {JSX.Element}
 */
export const SettingsSelectInput: FC<SettingsSelectInputProps> = ({ value, onChange, options }) => {
  // State to keep track of the dropdown menu open/closed state
  const [isOpen, setIsOpen] = useState(false);

  // Build a dictionary mapping option names to keys for efficient lookup
  // This dictionary is re-calculated every time the options prop changes
  const nameToKey = useMemo(() => {
    return options.reduce((dict, option) => {
      dict[option.name] = option.key;
      return dict;
    }, {});
  }, [options]);

  const keyToName = useMemo(() => {
    return options.reduce((dict, option) => {
      dict[option.key] = option.name;
      return dict;
    }, {});
  }, [options]);

  const valueLabel = keyToName?.[value] || value;
  const [selected, setSelected] = useState<string | number>(valueLabel);

  const onToggleClick = () => {
    setIsOpen((isOpen) => !isOpen);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} isFullWidth>
      {selected || 'Select an option'}
    </MenuToggle>
  );

  const renderOptions = () => {
    return options.map((option) => (
      <SelectOption key={option.key} value={option.name} description={option.description}>
        {option.name}
      </SelectOption>
    ));
  };

  // Callback function to handle selection in the dropdown menu
  const onSelect: (event?: ReactMouseEvent<Element, MouseEvent>, value?: string | number) => void =
    useCallback(
      (_event, value: string | number) => {
        // Use the dictionary to find the key corresponding to the selected name
        const key = nameToKey[value] || value;
        onChange(key);

        // Toggle the dropdown menu open state
        setSelected(value as string);
        setIsOpen(false);
      },
      [isOpen, nameToKey, onChange], // Dependencies for useCallback
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
      onOpenChange={(nextOpen: boolean) => setIsOpen(nextOpen)}
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
