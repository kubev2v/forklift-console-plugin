import type { FC, Ref } from 'react';

import { Badge, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
type GroupedEnumFilterToggleProps = {
  isOpen: boolean;
  onToggleClick: () => void;
  placeholderLabel?: string;
  selectedCount: number;
  showFilterIcon?: boolean;
  toggleRef: Ref<MenuToggleElement>;
};

const GroupedEnumFilterToggle: FC<GroupedEnumFilterToggleProps> = ({
  isOpen,
  onToggleClick,
  placeholderLabel,
  selectedCount,
  showFilterIcon,
  toggleRef,
}) => (
  <MenuToggle
    isExpanded={isOpen}
    isFullWidth
    onClick={onToggleClick}
    ref={toggleRef}
    {...(showFilterIcon && { icon: <FilterIcon /> })}
  >
    {placeholderLabel}
    {selectedCount > 0 && (
      <Badge className="pf-v6-u-ml-sm" isRead>
        {selectedCount}
      </Badge>
    )}
  </MenuToggle>
);

export default GroupedEnumFilterToggle;
