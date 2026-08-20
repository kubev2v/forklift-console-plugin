import type { FC, FormEvent, MouseEvent } from 'react';

import { NumberInput } from '@patternfly/react-core';

type SettingsNumberInputProps = {
  defaultValue: number;
  onChange: (value: string | number) => void;
  testId?: string;
  value: string | number;
};

const SettingsNumberInput: FC<SettingsNumberInputProps> = ({
  defaultValue,
  onChange,
  testId,
  value,
}) => {
  const normalize = (val: number | string): number => {
    const num = typeof val === 'number' ? val : parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      return defaultValue;
    }
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
      data-testid={testId}
      inputAriaLabel="number input"
      inputName="input"
      minusBtnAriaLabel="minus"
      onChange={onUserChange}
      onMinus={onUserMinus}
      onPlus={onUserPlus}
      plusBtnAriaLabel="plus"
      value={Number(value)}
    />
  );
};

export default SettingsNumberInput;
