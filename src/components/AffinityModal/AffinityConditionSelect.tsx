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
import type { AffinityRowData } from './utils/types';

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

  const handleChange = (event: ReactMouseEvent | undefined, value: string | number | undefined) => {
    event?.preventDefault();
    setFocusedAffinity({ ...focusedAffinity, condition: value });
    setIsOpen(false);
  };

  const onToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  return (
    <FormGroup fieldId="condition" isRequired label={t('Condition')}>
      <PfSelect
        toggle={selectToggle({
          isExpanded: isOpen,
          onClick: onToggle,
          selected: AFFINITY_CONDITION_LABELS[focusedAffinity?.condition],
          testId: 'affinity-condition-select',
        })}
        isOpen={isOpen}
        onSelect={handleChange}
        selected={focusedAffinity?.condition}
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
