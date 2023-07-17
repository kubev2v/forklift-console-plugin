import React, { useCallback, useMemo } from 'react';
import { useToggle } from 'src/modules/Providers/hooks';

import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

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
interface SettingsSelectInputProps {
  value: number | string;
  onChange: (value: number | string) => void;
  options: Option[];
}

/**
 * SelectInput component. Provides a select input form element with predefined options.
 *
 * @param {ModalInputComponentProps} props - Properties passed to the component
 * @returns {JSX.Element}
 */
export const SettingsSelectInput: React.FC<SettingsSelectInputProps> = ({
  value,
  onChange,
  options,
}) => {
  // State to keep track of the dropdown menu open/closed state
  const [isOpen, toggleIsOpen] = useToggle();

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

  // Callback function to handle selection in the dropdown menu
  const onSelect = useCallback(
    (event, selection) => {
      // Use the dictionary to find the key corresponding to the selected name
      const key = nameToKey[selection] || selection;
      onChange(key);

      // Toggle the dropdown menu open state
      toggleIsOpen();
    },
    [isOpen, nameToKey, onChange], // Dependencies for useCallback
  );

  // Render the Select component with dynamically created SelectOption children
  return (
    <Select
      variant={SelectVariant.single}
      placeholderText="Select an option"
      aria-label="Select Input with descriptions"
      value={valueLabel}
      onToggle={toggleIsOpen}
      onSelect={onSelect}
      selections={valueLabel}
      isOpen={isOpen}
      aria-labelledby="exampleSelect"
      menuAppendTo={() => document.body}
    >
      {options.map((option) => (
        // Create a SelectOption for each option
        <SelectOption key={option.key} value={option.name} description={option.description} />
      ))}
    </Select>
  );
};

export default SettingsSelectInput;
