import { type Dispatch, type MouseEvent, type Ref, type SetStateAction, useState } from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { t } from '@utils/i18n';

import { TimeRangeOptions } from '../utils/timeRangeOptions';

const HeaderActions = ({
  setSelectedTimeRange,
}: {
  setSelectedTimeRange: Dispatch<SetStateAction<TimeRangeOptions>>;
}) => {
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);

  const onToggleClick = () => {
    setIsDropdownOpened((opened) => !opened);
  };

  const onSelect = (_event: MouseEvent | undefined, _value: string | number | undefined) => {
    setIsDropdownOpened(false);
  };

  const handleTimeRangeSelectedFactory = (timeRange: TimeRangeOptions) => () => {
    onToggleClick();
    setSelectedTimeRange(timeRange);
  };

  return (
    <Dropdown
      isOpen={isDropdownOpened}
      onOpenChange={setIsDropdownOpened}
      onSelect={onSelect}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={onToggleClick}
          isExpanded={isDropdownOpened}
          variant={'plain'}
        >
          <EllipsisVIcon />
        </MenuToggle>
      )}
      shouldFocusFirstItemOnOpen={false}
      popperProps={{
        direction: 'down',
      }}
    >
      <DropdownList>
        <DropdownItem
          value={0}
          onClick={handleTimeRangeSelectedFactory(TimeRangeOptions.Last7Days)}
          key="7days"
        >
          {t('7 days')}
        </DropdownItem>
        <DropdownItem
          value={1}
          onClick={handleTimeRangeSelectedFactory(TimeRangeOptions.Last31Days)}
          key="31days"
        >
          {t('31 days')}
        </DropdownItem>
        <DropdownItem
          value={2}
          onClick={handleTimeRangeSelectedFactory(TimeRangeOptions.Last24H)}
          key="24hours"
        >
          {t('24 hours')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default HeaderActions;
