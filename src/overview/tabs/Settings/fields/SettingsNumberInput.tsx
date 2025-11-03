import type { FC, FormEvent, MouseEvent } from 'react';

import { NumberInput } from '@patternfly/react-core';

type SettingsNumberInputProps = {
  value: string | number;
  onChange: (value: string | number) => void;
  defaultValue: number;
};

const SettingsNumberInput: FC<SettingsNumberInputProps> = ({ defaultValue, onChange, value }) => {
  const normalize = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseInt(val, 10);
    if (isNaN(num) || num < 1) return defaultValue;
    return num;
  };

  const onUserMinus: (event: MouseEvent, name?: string) => void = () => {
    const updatedValue = normalize(value) - 1;
    onChange(updatedValue.toString());
  };

  const onUserPlus: (event: MouseEvent, name?: string) => void = () => {
    const updatedValue = normalize(value) + 1;
    onChange(updatedValue.toString());
  };

  const onUserChange: (event: FormEvent<HTMLInputElement>) => void = (event) => {
    const { value: inputValue } = event.target as HTMLInputElement;
    const updatedValue = normalize(inputValue);
    onChange(updatedValue.toString());
  };

  return (
    <NumberInput
      value={Number(value)}
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
