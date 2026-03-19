import { type FC, type MouseEvent, type Ref, useMemo, useState } from 'react';

import {
  Badge,
  Button,
  ButtonVariant,
  MenuFooter,
  MenuToggle,
  type MenuToggleElement,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type PlanOption = {
  description: string;
  id: string;
  name: string;
};

type PlanSelectFilterProps = {
  isDisabled?: boolean;
  plans: PlanOption[];
  selectedPlanIds: string[];
  setSelectedPlanIds: (ids: string[]) => void;
};

const PlanSelectFilter: FC<PlanSelectFilterProps> = ({
  isDisabled = false,
  plans,
  selectedPlanIds,
  setSelectedPlanIds,
}) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');

  const disabled = isDisabled || isEmpty(plans);

  const filteredPlans = useMemo(
    () =>
      isEmpty(filterText)
        ? plans
        : plans.filter((plan) => plan.name.toLowerCase().includes(filterText.toLowerCase())),
    [plans, filterText],
  );

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

  const onOpenChange = (open: boolean): void => {
    setIsOpen(open);
    if (!open) {
      setFilterText('');
    }
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
      isScrollable
      isOpen={isOpen}
      onSelect={onSelect}
      aria-label={t('Filter by plan')}
      toggle={toggle}
      onOpenChange={onOpenChange}
    >
      <div className="forklift-overview__throughput-plan-search">
        <SearchInput
          placeholder={t('Filter plans...')}
          value={filterText}
          onChange={(_event, value) => {
            setFilterText(value);
          }}
          onClear={() => {
            setFilterText('');
          }}
          aria-label={t('Search plans')}
        />
      </div>
      <SelectList>
        {filteredPlans.map((plan) => (
          <SelectOption
            key={plan.id}
            value={plan.id}
            hasCheckbox
            isSelected={selectedPlanIds.includes(plan.id)}
            description={plan.description}
          >
            {plan.name}
          </SelectOption>
        ))}
        {!isEmpty(filterText) && isEmpty(filteredPlans) && (
          <SelectOption isDisabled key="no-results" value="no-results">
            {t('No plans matching "{{filter}}"', { filter: filterText })}
          </SelectOption>
        )}
      </SelectList>
      {!isEmpty(plans) && (
        <MenuFooter>
          <Button
            variant={ButtonVariant.link}
            isInline
            onClick={() => {
              setSelectedPlanIds(plans.map((plan) => plan.id));
            }}
            isDisabled={selectedPlanIds.length === plans.length}
          >
            {t('Select all')}
          </Button>
          {' | '}
          <Button
            variant={ButtonVariant.link}
            isInline
            onClick={() => {
              setSelectedPlanIds([]);
            }}
            isDisabled={isEmpty(selectedPlanIds)}
          >
            {t('Clear selection')}
          </Button>
        </MenuFooter>
      )}
    </Select>
  );
};

export default PlanSelectFilter;
