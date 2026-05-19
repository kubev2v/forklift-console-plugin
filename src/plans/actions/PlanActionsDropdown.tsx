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

  const onToggleClick = () => {
    setIsOpen((open) => !open);
  };

  const onSelect = () => {
    setIsOpen(false);
  };

  return (
    <Dropdown
      className={isDetailsPage ? 'forklift-dropdown' : undefined}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={onToggleClick}
          isExpanded={isOpen}
          variant={isDetailsPage ? 'default' : 'plain'}
          data-testid={isDetailsPage ? 'plan-actions-dropdown-button' : 'plan-kebab-actions-button'}
        >
          {isDetailsPage ? t('Actions') : <EllipsisVIcon />}
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
      popperProps={{
        position: 'right',
        width: '200px',
      }}
    >
      <PlanActionsDropdownItems isDetailsPage={isDetailsPage} plan={plan} />
    </Dropdown>
  );
};

export default PlanActionsDropdown;
