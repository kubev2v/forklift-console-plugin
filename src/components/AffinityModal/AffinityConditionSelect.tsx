import {
  type Dispatch,
  type FC,
  type MouseEvent as ReactMouseEvent,
  type SetStateAction,
  useState,
} from 'react';

import { FormGroup, Select as PfSelect, SelectOption } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import selectToggle from '@utils/selectToggle';

import { AFFINITY_CONDITION_LABELS } from './utils/constants';
import type { AffinityCondition, AffinityRowData } from './utils/types';

type AffinityConditionSelectProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
};

const AffinityConditionSelect: FC<AffinityConditionSelectProps> = ({
  focusedAffinity,
  setFocusedAffinity,
}) => {
  const { t } = useForkliftTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (
    event: ReactMouseEvent | undefined,
    value: string | number | undefined,
  ): void => {
    event?.preventDefault();
    setFocusedAffinity({ ...focusedAffinity, condition: value as AffinityCondition });
    setIsOpen(false);
  };

  const onToggle = (): void => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  return (
    <FormGroup fieldId="condition" isRequired label={t('Condition')}>
      <PfSelect
        isOpen={isOpen}
        onSelect={handleChange}
        selected={focusedAffinity?.condition}
        toggle={selectToggle({
          isExpanded: isOpen,
          onClick: onToggle,
          selected: AFFINITY_CONDITION_LABELS[focusedAffinity?.condition],
          testId: 'affinity-condition-select',
        })}
      >
        {Object.entries(AFFINITY_CONDITION_LABELS).map(([key, value]) => (
          <SelectOption key={key} value={key}>
            {value}
          </SelectOption>
        ))}
      </PfSelect>
    </FormGroup>
  );
};

export default AffinityConditionSelect;
