import { type FC, type Ref, useState } from 'react';

import type { V1beta1Migration } from '@forklift-ui/types';
import { Dropdown, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import VMCutoverActionsDropDownItems from './VMMigrationActionsDropdownItems';

type VMMigrationActionsDropdownProps = {
  isCompleted: boolean;
  isInStorePowerState: boolean;
  migration: V1beta1Migration;
  vmId: string;
  vmName: string;
};

const VMMigrationActionsDropdown: FC<VMMigrationActionsDropdownProps> = ({
  isCompleted,
  isInStorePowerState,
  migration,
  vmId,
  vmName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useForkliftTranslation();

  const handleClick = (): void => {
    setIsOpen((open) => !open);
  };

  const handleSelect = (): void => {
    setIsOpen(false);
  };

  return (
    !isCompleted && (
      <Dropdown
        className="forklift-dropdown"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={handleSelect}
        popperProps={{
          position: 'right',
        }}
        shouldFocusToggleOnSelect
        toggle={(toggleRef: Ref<MenuToggleElement>) => (
          <MenuToggle
            aria-label={t('Actions')}
            data-testid="vm-cutover-modal-toggle"
            isExpanded={isOpen}
            onClick={handleClick}
            ref={toggleRef}
            variant="plain"
          >
            <EllipsisVIcon />
          </MenuToggle>
        )}
      >
        <VMCutoverActionsDropDownItems
          isInStorePowerState={isInStorePowerState}
          migration={migration}
          vmId={vmId}
          vmName={vmName}
        />
      </Dropdown>
    )
  );
};

export default VMMigrationActionsDropdown;
