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
      badge={
        disabled ? undefined : (
          <Badge data-testid="plan-badge-count" isRead>
            {selectedPlanIds.length}
          </Badge>
        )
      }
      className="forklift-overview__throughput-plan-select"
      isDisabled={disabled}
      isExpanded={isOpen}
      onClick={onToggleClick}
      ref={toggleRef}
    >
      {t('Plans')}
    </MenuToggle>
  );

  return (
    // eslint-disable-next-line no-restricted-syntax
    <Select
      aria-label={t('Filter by plan')}
      isOpen={isOpen}
      isScrollable
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      toggle={toggle}
    >
      <div className="forklift-overview__throughput-plan-search">
        <SearchInput
          aria-label={t('Search plans')}
          onChange={(_event, value) => {
            setFilterText(value);
          }}
          onClear={() => {
            setFilterText('');
          }}
          placeholder={t('Filter plans...')}
          value={filterText}
        />
      </div>
      <SelectList>
        {filteredPlans.map((plan) => (
          <SelectOption
            description={plan.description}
            hasCheckbox
            isSelected={selectedPlanIds.includes(plan.id)}
            key={plan.id}
            value={plan.id}
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
            isDisabled={selectedPlanIds.length === plans.length}
            isInline
            onClick={() => {
              setSelectedPlanIds(plans.map((plan) => plan.id));
            }}
            variant={ButtonVariant.link}
          >
            {t('Select all')}
          </Button>
          {' | '}
          <Button
            isDisabled={isEmpty(selectedPlanIds)}
            isInline
            onClick={() => {
              setSelectedPlanIds([]);
            }}
            variant={ButtonVariant.link}
          >
            {t('Clear selection')}
          </Button>
        </MenuFooter>
      )}
    </Select>
  );
};

export default PlanSelectFilter;
