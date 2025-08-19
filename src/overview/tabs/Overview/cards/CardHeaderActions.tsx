import { type MouseEvent, type Ref, useState } from 'react';

import { MenuToggle, type MenuToggleElement, Select, SelectOption } from '@patternfly/react-core';
import { t } from '@utils/i18n';

import { TimeRangeOptions, valueToLabel } from '../utils/timeRangeOptions';

const HeaderActions = ({
  selectedTimeRange,
  setSelectedTimeRange,
  showAll = false,
}: {
  selectedTimeRange: TimeRangeOptions;
  setSelectedTimeRange: (range: TimeRangeOptions) => void;
  showAll?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (_event: MouseEvent | undefined, value: string | number | undefined) => {
    setSelectedTimeRange(value as TimeRangeOptions);
    setIsOpen(false);
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      className="forklift-overview__cards-select"
    >
      {valueToLabel[selectedTimeRange]}
    </MenuToggle>
  );

  return (
    // Custom select does not support the complex toggle being used here
    // eslint-disable-next-line no-restricted-syntax
    <Select
      isOpen={isOpen}
      onSelect={onSelect}
      selected={selectedTimeRange}
      aria-label={t('Select time range')}
      toggle={toggle}
      onOpenChange={setIsOpen}
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
    </Select>
  );
};

export default HeaderActions;
