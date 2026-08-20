import { type FunctionComponent, type KeyboardEvent, useState } from 'react';

import { TextInput } from '@patternfly/react-core';

type LazyTextInputProps = {
  ariaLabel?: string;
  onChange: (value: string) => void;
  type?:
    | 'text'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'month'
    | 'number'
    | 'password'
    | 'search'
    | 'tel'
    | 'time'
    | 'url';
  value: string;
};

/**
 * LazyTextInput is a custom input component that triggers the onChange event
 * only when the input loses focus (onBlur) or when the Enter key is pressed.
 *
 * @param {string} value - The current value of the input.
 * @param {(value: string) => void} onChange - Callback function to handle value changes.
 * @param {string} ariaLabel - Aria label for accessibility.
 * @returns {ReactElement} The rendered input component.
 */
export const LazyTextInput: FunctionComponent<LazyTextInputProps> = ({
  ariaLabel = '',
  onChange,
  type = 'text',
  value: propValue,
}) => {
  const [value, setValue] = useState(propValue);

  const handleBlur = (): void => {
    if (value !== propValue) {
      onChange(value);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' && value !== propValue) {
      onChange(value);
    }
  };

  const onChangeText = (newValue: string): void => {
    setValue(newValue);
  };

  return (
    <TextInput
      aria-label={ariaLabel}
      onBlur={handleBlur}
      onChange={(_event, val) => {
        onChangeText(val);
      }}
      onKeyDown={handleKeyDown}
      spellCheck="false"
      type={type}
      value={value}
    />
  );
};
