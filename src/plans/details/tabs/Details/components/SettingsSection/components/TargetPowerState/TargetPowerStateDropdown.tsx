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
import { useForkliftTranslation } from '@utils/i18n.tsx';

type TargetPowerStateDropdownProps = {
  value: TargetPowerStateValue;
  allowInherit?: boolean;
  planState?: TargetPowerStateValue;
  onChange: (val: TargetPowerStateValue) => void;
};

const TargetPowerStateDropdown: FC<TargetPowerStateDropdownProps> = ({
  allowInherit,
  onChange,
  planState,
  value,
}) => {
  const { t } = useForkliftTranslation();
  const inheritValue = 'Inherit plan wide setting';

  return (
    <Select
      id="targetPowerState"
      testId="target-power-state-select"
      value={allowInherit && !value ? inheritValue : getTargetPowerStateLabel(value)}
      onSelect={(_event, val) => {
        onChange(val === inheritValue ? undefined : (val as unknown as TargetPowerState)?.value);
      }}
      placeholder={defaultTargetPowerStateOption.label}
    >
      <SelectList>
        {allowInherit ? (
          <SelectOption
            key="inherit"
            value={inheritValue}
            description={`${t('Set to:')} ${getTargetPowerStateLabel(planState)}`}
            isSelected={!value}
            data-testid="power-state-option-inherit"
          >
            {inheritValue}
          </SelectOption>
        ) : null}
        {targetPowerStateOptions.map((option) => (
          <SelectOption
            key={option.value}
            value={option}
            description={option.description}
            isSelected={value === option.value}
            data-testid={`power-state-option-${option.value}`}
          >
            {option.label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

export default TargetPowerStateDropdown;
