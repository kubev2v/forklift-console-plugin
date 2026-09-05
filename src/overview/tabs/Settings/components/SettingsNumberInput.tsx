import type { FC, FormEvent, MouseEvent } from 'react';

import { NumberInput } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type SettingsNumberInputProps = {
  defaultValue: number;
  min?: number;
  onChange: (value: string | number) => void;
  onError?: (error: string | undefined) => void;
  testId?: string;
  validated?: 'default' | 'error';
  value: string | number;
};

const SettingsNumberInput: FC<SettingsNumberInputProps> = ({
  defaultValue,
  min = 0,
  onChange,
  onError,
  testId,
  validated = 'default',
  value,
}) => {
  const { t } = useForkliftTranslation();

  const normalize = (val: number | string): number => {
    const num = typeof val === 'number' ? val : parseInt(val, 10);
    if (isNaN(num) || num < min) {
      onError?.(t('The value is invalid. Reverting to default value.'));
      return defaultValue;
    }
    onError?.(undefined);
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
      min={min}
      minusBtnAriaLabel="minus"
      onChange={onUserChange}
      onMinus={onUserMinus}
      onPlus={onUserPlus}
      plusBtnAriaLabel="plus"
      validated={validated}
      value={Number(value)}
    />
  );
};

export default SettingsNumberInput;
