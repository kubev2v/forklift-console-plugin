import { type MouseEvent, type ReactElement, type Ref, useState } from 'react';

import {
  MenuToggle,
  type MenuToggleElement,
  Select as PatternFlySelect,
  SelectOption,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { getValueToLabel, TimeRangeOptions } from '../utils/timeRangeOptions';

const HeaderActions = ({
  selectedTimeRange,
  setSelectedTimeRange,
  showAll = false,
}: {
  selectedTimeRange: TimeRangeOptions;
  setSelectedTimeRange: (range: TimeRangeOptions) => void;
  showAll?: boolean;
}): ReactElement => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const valueToLabel = getValueToLabel();

  const onSelect = (_event: MouseEvent | undefined, value: string | number | undefined): void => {
    setSelectedTimeRange(value as TimeRangeOptions);
    setIsOpen(false);
  };

  const onToggleClick = (): void => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>): ReactElement => (
    <MenuToggle
      className="forklift-overview__cards-select"
      isExpanded={isOpen}
      onClick={onToggleClick}
      ref={toggleRef}
    >
      {valueToLabel[selectedTimeRange]}
    </MenuToggle>
  );

  return (
    // Cannot use @components/common/Select — custom MenuToggle is unsupported there
    <PatternFlySelect
      aria-label={t('Select time range')}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      selected={selectedTimeRange}
      toggle={toggle}
    >
      <SelectOption value={TimeRangeOptions.Last24H}>
        {valueToLabel[TimeRangeOptions.Last24H]}
      </SelectOption>
      <SelectOption value={TimeRangeOptions.Last10Days}>
        {valueToLabel[TimeRangeOptions.Last10Days]}
      </SelectOption>
      <SelectOption value={TimeRangeOptions.Last31Days}>
        {valueToLabel[TimeRangeOptions.Last31Days]}
      </SelectOption>
      {showAll && (
        <SelectOption value={TimeRangeOptions.All}>
          {valueToLabel[TimeRangeOptions.All]}
        </SelectOption>
      )}
    </PatternFlySelect>
  );
};

export default HeaderActions;
