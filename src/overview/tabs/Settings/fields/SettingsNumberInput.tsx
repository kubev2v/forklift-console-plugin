import type { FC, FormEvent, MouseEvent } from 'react';

import { NumberInput } from '@patternfly/react-core';

type SettingsNumberInputProps = {
  value: number | string;
  onChange: (value: number | string) => void;
  defaultValue: number;
};

const SettingsNumberInput: FC<SettingsNumberInputProps> = ({ defaultValue, onChange, value }) => {
  const numberValue = Number(value);

  const normalize = (val: number) => (val < 0 ? defaultValue : val);

  const onUserMinus: (event: MouseEvent, name?: string) => void = () => {
    onChange(normalize(numberValue - 1).toString());
  };

  const onUserPlus: (event: MouseEvent, name?: string) => void = () => {
    onChange(normalize(numberValue + 1).toString());
  };

  const onUserChange: (event: FormEvent<HTMLInputElement>) => void = (event) => {
    const { value: inputValue } = event.target as HTMLInputElement;
    const num = Number(inputValue);
    onChange(normalize(num).toString());
  };

  return (
    <NumberInput
      value={numberValue}
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
