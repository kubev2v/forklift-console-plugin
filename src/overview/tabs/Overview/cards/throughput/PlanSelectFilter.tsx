import { type MouseEvent, type Ref, useState } from 'react';

import {
  Badge,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectOption,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type PlanOption = {
  id: string;
  name: string;
};

type PlanSelectFilterProps = {
  isDisabled?: boolean;
  plans: PlanOption[];
  selectedPlanIds: string[];
  setSelectedPlanIds: (ids: string[]) => void;
};

const PlanSelectFilter = ({
  isDisabled = false,
  plans,
  selectedPlanIds,
  setSelectedPlanIds,
}: PlanSelectFilterProps): JSX.Element => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const disabled = isDisabled || isEmpty(plans);

  const onSelect = (_event: MouseEvent | undefined, value: string | number | undefined): void => {
    const planId = value as string;
    const isSelected = selectedPlanIds.includes(planId);

    setSelectedPlanIds(
      isSelected ? selectedPlanIds.filter((id) => id !== planId) : [...selectedPlanIds, planId],
    );
  };

  const onToggleClick = (): void => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>): JSX.Element => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      isDisabled={disabled}
      className="forklift-overview__throughput-plan-select"
      badge={disabled ? undefined : <Badge isRead>{selectedPlanIds.length}</Badge>}
    >
      {t('Plans')}
    </MenuToggle>
  );

  return (
    // eslint-disable-next-line no-restricted-syntax
    <Select
      isOpen={isOpen}
      onSelect={onSelect}
      aria-label={t('Filter by plan')}
      toggle={toggle}
      onOpenChange={setIsOpen}
    >
      {plans.map((plan) => (
        <SelectOption
          key={plan.id}
          value={plan.id}
          hasCheckbox
          isSelected={selectedPlanIds.includes(plan.id)}
        >
          {plan.name}
        </SelectOption>
      ))}
    </Select>
  );
};

export default PlanSelectFilter;
