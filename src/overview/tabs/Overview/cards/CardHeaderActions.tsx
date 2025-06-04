import { type MouseEvent, type Ref, useState } from 'react';

import { MenuToggle, type MenuToggleElement, Select, SelectOption } from '@patternfly/react-core';
import { t } from '@utils/i18n';

import { TimeRangeOptions } from '../utils/timeRangeOptions';

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

  const valueToLabel = {
    [TimeRangeOptions.All]: t('All'),
    [TimeRangeOptions.Last10Days]: t('Last 10 days'),
    [TimeRangeOptions.Last24H]: t('Last 24 hours'),
    [TimeRangeOptions.Last31Days]: t('Last 31 days'),
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={
        {
          width: '140px',
        } as React.CSSProperties
      }
    >
      {valueToLabel[selectedTimeRange]}
    </MenuToggle>
  );

  return (
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
