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

import { AFFINITY_TYPE_LABELS } from './utils/constants';
import type { AffinityRowData } from './utils/types';

type AffinityTypeSelectProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
};

const AffinityTypeSelect: FC<AffinityTypeSelectProps> = ({
  focusedAffinity,
  setFocusedAffinity,
}) => {
  const { t } = useForkliftTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (event: ReactMouseEvent | undefined, value: string | number | undefined) => {
    event?.preventDefault();
    setFocusedAffinity({ ...focusedAffinity, type: value });
    setIsOpen(false);
  };

  const onToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };
  return (
    <FormGroup fieldId="type" isRequired label={t('Type')}>
      <PfSelect
        toggle={selectToggle({
          isExpanded: isOpen,
          onClick: onToggle,
          selected: AFFINITY_TYPE_LABELS[focusedAffinity?.type],
        })}
        isOpen={isOpen}
        onSelect={handleChange}
        selected={focusedAffinity?.type}
      >
        {Object.entries(AFFINITY_TYPE_LABELS).map(([key, value]) => (
          <SelectOption key={key} value={key}>
            {value}
          </SelectOption>
        ))}
      </PfSelect>
    </FormGroup>
  );
};

export default AffinityTypeSelect;
