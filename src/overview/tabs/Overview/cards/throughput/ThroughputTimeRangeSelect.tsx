import { type MouseEvent, type Ref, useState } from 'react';

import { MenuToggle, type MenuToggleElement, Select, SelectOption } from '@patternfly/react-core';
import { t } from '@utils/i18n';

import { ThroughputTimeRange, throughputTimeRangeToLabel } from '../../utils/throughputTimeRanges';

type ThroughputTimeRangeSelectProps = {
  selectedRange: ThroughputTimeRange;
  setSelectedRange: (range: ThroughputTimeRange) => void;
};

const ORDERED_RANGES: ThroughputTimeRange[] = [
  ThroughputTimeRange.Last30Min,
  ThroughputTimeRange.Last1H,
  ThroughputTimeRange.Last6H,
  ThroughputTimeRange.Last24H,
  ThroughputTimeRange.Last2D,
  ThroughputTimeRange.Last7D,
];

const ThroughputTimeRangeSelect = ({
  selectedRange,
  setSelectedRange,
}: ThroughputTimeRangeSelectProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (_event: MouseEvent | undefined, value: string | number | undefined): void => {
    setSelectedRange(value as ThroughputTimeRange);
    setIsOpen(false);
  };

  const onToggleClick = (): void => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>): JSX.Element => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      className="forklift-overview__cards-select"
    >
      {throughputTimeRangeToLabel[selectedRange]}
    </MenuToggle>
  );

  return (
    // eslint-disable-next-line no-restricted-syntax
    <Select
      isOpen={isOpen}
      onSelect={onSelect}
      selected={selectedRange}
      aria-label={t('Select time range')}
      toggle={toggle}
      onOpenChange={setIsOpen}
    >
      {ORDERED_RANGES.map((range) => (
        <SelectOption key={range} value={range}>
          {throughputTimeRangeToLabel[range]}
        </SelectOption>
      ))}
    </Select>
  );
};

export default ThroughputTimeRangeSelect;
