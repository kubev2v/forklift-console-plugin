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
  const inheritValue = `Inherit from migration plan (${getTargetPowerStateLabel(planState)})`;

  return (
    <Select
      id="targetPowerState"
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
            description={t('Inherit target power state from the migration plan')}
          >
            {inheritValue}
          </SelectOption>
        ) : null}
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
