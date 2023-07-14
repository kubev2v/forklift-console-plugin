import React, { useCallback, useState } from 'react';

import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

/**
 * @typedef Option
 * @property {number} key
 * @property {number | string} name
 * @property {string} description
 */
interface Option {
  key: number;
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
  onChange: (value: string) => void;
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
  const [isOpen, setIsOpen] = useState(false);

  /** Toggles the select input visibility */
  const onToggle = useCallback((isOpen: boolean) => {
    setIsOpen(isOpen);
  }, []);

  /** Updates the current selected value */
  const onSelect = useCallback(
    (event, selection) => {
      onChange(selection);
      setIsOpen(!isOpen);
    },
    [isOpen, onChange],
  );

  return (
    <Select
      variant={SelectVariant.single}
      placeholderText="Select an option"
      aria-label="Select Input with descriptions"
      value={value}
      onToggle={onToggle}
      onSelect={onSelect}
      selections={value}
      isOpen={isOpen}
      aria-labelledby="exampleSelect"
      menuAppendTo={() => document.body}
    >
      {options.map((option) => (
        <SelectOption key={option.key} value={option.name} description={option.description} />
      ))}
    </Select>
  );
};

export default SettingsSelectInput;
