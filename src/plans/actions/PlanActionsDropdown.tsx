import { type FC, type Ref, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Plan } from '@kubev2v/types';
import { Dropdown, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import PlanActionsDropdownItems from './PlanActionsDropdownItems';

import './PlanActionsDropdown.scss';

type PlanActionsDropdownProps = {
  isKebab?: boolean;
  plan: V1beta1Plan;
};

const PlanActionsDropdown: FC<PlanActionsDropdownProps> = ({ isKebab, plan }) => {
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
      className={isKebab ? undefined : 'forklift-dropdown'}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={onToggleClick}
          isExpanded={isOpen}
          variant={isKebab ? 'plain' : 'default'}
          data-testid={isKebab ? 'plan-kebab-actions-button' : 'plan-actions-dropdown-button'}
        >
          {isKebab ? <EllipsisVIcon /> : t('Actions')}
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
      popperProps={{
        position: 'right',
        width: '200px',
      }}
    >
      <PlanActionsDropdownItems plan={plan} />
    </Dropdown>
  );
};

export default PlanActionsDropdown;
