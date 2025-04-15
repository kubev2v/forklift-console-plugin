import { type FC, type FormEvent, type MouseEvent, useState } from 'react';

import { NumberInput } from '@patternfly/react-core';

import type { SettingsSelectInputProps } from './SettingsSelectInput';

const SettingsNumberInput: FC<SettingsSelectInputProps> = ({ onChange, value: value_ = 0 }) => {
  const [value, setValue] = useState<number | ''>(parseInt(value_.toString(), 10));

  const setNewValue = (newValue: number) => {
    setValue(newValue);
    onChange(newValue.toString());
  };

  const onUserMinus: (event: MouseEvent, name?: string) => void = () => {
    const newValue = (value || 0) - 1;
    setNewValue(newValue);
  };

  const onUserPlus: (event: MouseEvent, name?: string) => void = () => {
    const newValue = (value || 0) + 1;
    setNewValue(newValue);
  };

  const onUserChange: (event: FormEvent<HTMLInputElement>) => void = (event) => {
    const { value } = event.target as HTMLInputElement;
    const newValue = value === '' ? value : Number(value);
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
