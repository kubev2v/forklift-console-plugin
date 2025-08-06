import type { FC } from 'react';
import {
  defaultTargetPowerStateOption,
  getTargetPowerStateLabel,
  type TargetPowerState,
  targetPowerStateOptions,
  type TargetPowerStateValue,
} from 'src/plans/constants';

import Select from '@components/common/Select';
import { SelectList, SelectOption } from '@patternfly/react-core';

type TargetPowerStateDropdownProps = {
  value: TargetPowerStateValue;
  onChange: (val: TargetPowerStateValue) => void;
};

const TargetPowerStateDropdown: FC<TargetPowerStateDropdownProps> = ({ onChange, value }) => {
  return (
    <Select
      id="targetPowerState"
      value={getTargetPowerStateLabel(value)}
      onSelect={(_event, val) => {
        onChange((val as unknown as TargetPowerState).value);
      }}
      placeholder={defaultTargetPowerStateOption.label}
    >
      <SelectList>
        {targetPowerStateOptions.map((option) => (
          <SelectOption key={option.value} value={option} description={option.description}>
            {option.label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

export default TargetPowerStateDropdown;
