import type { FC, FormEvent, MouseEvent } from 'react';

import { NumberInput } from '@patternfly/react-core';

type SettingsNumberInputProps = {
  defaultValue: number;
  min?: number;
  onBlur?: () => void;
  onChange: (value: string | number) => void;
  testId?: string;
  validated?: 'default' | 'error';
  value: string | number;
};

const SettingsNumberInput: FC<SettingsNumberInputProps> = ({
  defaultValue,
  min = 0,
  onBlur,
  onChange,
  testId,
  validated = 'default',
  value,
}) => {
  const normalize = (val: number | string): number => {
    const num = typeof val === 'number' ? val : parseInt(val, 10);
    return isNaN(num) ? defaultValue : num;
  };

  const onUserMinus: (event: MouseEvent, name?: string) => void = () => {
    onChange((normalize(value) - 1).toString());
  };

  const onUserPlus: (event: MouseEvent, name?: string) => void = () => {
    onChange((normalize(value) + 1).toString());
  };

  const onUserChange: (event: FormEvent<HTMLInputElement>) => void = (event) => {
    const { value: inputValue } = event.target as HTMLInputElement;
    onChange(inputValue);
  };

  return (
    <NumberInput
      data-testid={testId}
      inputAriaLabel="number input"
      inputName="input"
      min={min}
      minusBtnAriaLabel="minus"
      onBlur={onBlur}
      onChange={onUserChange}
      onMinus={onUserMinus}
      onPlus={onUserPlus}
      plusBtnAriaLabel="plus"
      validated={validated}
      value={Number.isFinite(Number(value)) ? Number(value) : ''}
    />
  );
};

export default SettingsNumberInput;
