import { type FC, type MouseEvent, useMemo, useState } from 'react';

import { BLANK_OPTION_KEY, buildNameToKeyMap } from './settingsSelectInputUtils';
import type { Option } from './SettingsSelectInputView';
import { SettingsSelectInputView } from './SettingsSelectInputView';

type BlankOption = {
  description?: string;
  name: string;
};

type SettingsSelectInputProps = {
  blankOption?: BlankOption;
  isScrollable?: boolean;
  onChange: (value: number | string) => void;
  options: Option[];
  showKeyAsSelected?: boolean;
  testId?: string;
  value: number | string;
};

const SettingsSelectInput: FC<SettingsSelectInputProps> = ({
  blankOption,
  isScrollable = false,
  onChange,
  options,
  showKeyAsSelected = false,
  testId,
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const nameToKey = useMemo(() => buildNameToKeyMap(options, blankOption), [options, blankOption]);

  const onSelect = (event?: MouseEvent, selectedValue?: string | number): void => {
    if (selectedValue === undefined) {
      setIsOpen(false);
      return;
    }

    const key = nameToKey[selectedValue] ?? selectedValue;
    onChange(key === BLANK_OPTION_KEY ? '' : key);
    setIsOpen(false);
  };

  return (
    <SettingsSelectInputView
      blankOption={blankOption}
      isOpen={isOpen}
      isScrollable={isScrollable}
      onChange={onChange}
      onSelect={onSelect}
      options={options}
      setIsOpen={setIsOpen}
      showKeyAsSelected={showKeyAsSelected}
      testId={testId}
      value={value}
    />
  );
};

export default SettingsSelectInput;
export type { Option } from './SettingsSelectInputView';
