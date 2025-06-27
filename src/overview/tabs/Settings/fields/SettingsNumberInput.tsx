import type { FC, FormEvent, MouseEvent } from 'react';

import { NumberInput } from '@patternfly/react-core';

type SettingsNumberInputProps = {
  value: number | '';
  onChange: (value: number | string) => void;
  defaultValue: number;
};

const SettingsNumberInput: FC<SettingsNumberInputProps> = ({ defaultValue, onChange, value }) => {
  const normalize = (val: number | string) =>
    typeof val !== 'number' || val < 0 ? defaultValue : Number(val);

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
