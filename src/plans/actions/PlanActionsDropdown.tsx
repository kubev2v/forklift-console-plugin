import { type FC, type Ref, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Plan } from '@forklift-ui/types';
import { Dropdown, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import PlanActionsDropdownItems from './PlanActionsDropdownItems';

import './PlanActionsDropdown.scss';

type PlanActionsDropdownProps = {
  isDetailsPage?: boolean;
  plan: V1beta1Plan;
};

const PlanActionsDropdown: FC<PlanActionsDropdownProps> = ({ isDetailsPage, plan }) => {
  const { t } = useForkliftTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = (): void => {
    setIsOpen((open) => !open);
  };

  const onSelect = (): void => {
    setIsOpen(false);
  };

  return (
    <Dropdown
      className={isDetailsPage ? 'forklift-dropdown' : undefined}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      popperProps={{
        position: 'right',
        width: '200px',
      }}
      shouldFocusToggleOnSelect
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          data-testid={isDetailsPage ? 'plan-actions-dropdown-button' : 'plan-kebab-actions-button'}
          isExpanded={isOpen}
          onClick={onToggleClick}
          ref={toggleRef}
          variant={isDetailsPage ? 'default' : 'plain'}
        >
          {isDetailsPage ? t('Actions') : <EllipsisVIcon />}
        </MenuToggle>
      )}
    >
      <PlanActionsDropdownItems isDetailsPage={isDetailsPage} plan={plan} />
    </Dropdown>
  );
};

export default PlanActionsDropdown;
