import React, { useState } from 'react';

import { TextInput } from '@patternfly/react-core';

type LazyTextInputProps = {
  value: string;
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
  ariaLabel?: string;
};

/**
 * LazyTextInput is a custom input component that triggers the onChange event
 * only when the input loses focus (onBlur) or when the Enter key is pressed.
 *
 * @param {string} value - The current value of the input.
 * @param {(value: string) => void} onChange - Callback function to handle value changes.
 * @param {string} ariaLabel - Aria label for accessibility.
 * @returns {React.ReactElement} The rendered input component.
 */
export const LazyTextInput: React.FunctionComponent<LazyTextInputProps> = ({
  ariaLabel = '',
  onChange,
  type = 'text',
  value: propValue,
}) => {
  const [value, setValue] = useState(propValue);

  const handleBlur = () => {
    if (value !== propValue) {
      onChange(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (value !== propValue) {
        onChange(value);
      }
    }
  };

  const onChangeText: (value: string, event: React.FormEvent<HTMLInputElement>) => void = (
    value,
  ) => {
    setValue(value);
  };

  return (
    <TextInput
      spellCheck="false"
      value={value}
      type={type}
      onChange={(e, v) => {
        onChangeText(v, e);
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
    />
  );
};
