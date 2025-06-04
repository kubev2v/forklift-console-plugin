import type { FC, FormEvent, MouseEvent } from 'react';

import { NumberInput } from '@patternfly/react-core';

import type { SettingsSelectInputProps } from './SettingsSelectInput';

const SettingsNumberInput: FC<SettingsSelectInputProps> = ({ onChange, value }) => {
  const numberValue = Number(value) || 20;

  const normalize = (val: number) => (val <= 0 ? 20 : val);

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

  // Render the Select component with dynamically created SelectOption children
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
