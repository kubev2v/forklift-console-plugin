import React from 'react';

import { NumberInput } from '@patternfly/react-core';

import { SettingsSelectInputProps } from './SettingsSelectInput';

export const SettingsNumberInput: React.FC<SettingsSelectInputProps> = ({
  value: value_ = 0,
  onChange,
}) => {
  const [value, setValue] = React.useState<number | ''>(parseInt(value_.toString()));

  const setNewValue = (newValue: number) => {
    setValue(newValue);
    onChange(newValue.toString());
  };

  const onUserMinus = () => {
    const newValue = (value || 0) - 1;
    setNewValue(newValue);
  };

  const onUserPlus = () => {
    const newValue = (value || 0) + 1;
    setNewValue(newValue);
  };

  const onUserChange = (event: React.FormEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    const newValue = value === '' ? value : +value;
    setNewValue(newValue || 0);
  };

  // Render the Select component with dynamically created SelectOption children
  return (
    <NumberInput
      value={value}
      onMinus={onUserMinus}
      onChange={onUserChange}
      onPlus={onUserPlus}
      inputName="input"
      inputAriaLabel="number input"
      minusBtnAriaLabel="minus"
      plusBtnAriaLabel="plus"
    />
  );
};

export default SettingsNumberInput;
