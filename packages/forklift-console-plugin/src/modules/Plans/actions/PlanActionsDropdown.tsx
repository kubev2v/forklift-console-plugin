import React from 'react';
import { useToggle } from 'src/modules/Providers/hooks';
import { ModalHOC } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Dropdown,
  DropdownPosition,
  DropdownToggle,
  KebabToggle,
} from '@patternfly/react-core/deprecated';

import { CellProps } from '../views/list/components';

import { PlanActionsDropdownItems } from './PlanActionsDropdownItems';

import './PlanActionsDropdown.style.css';

const PlanActionsKebabDropdown_: React.FC<PlanActionsDropdownProps> = ({ data, isKebab }) => {
  const { t } = useForkliftTranslation();

  // Hook for managing the open/close state of the dropdown
  const [isDropdownOpen, toggle] = useToggle();

  // Returning the Dropdown component from PatternFly library
  return (
    <Dropdown
      onSelect={toggle}
      isOpen={isDropdownOpen}
      isPlain
      position={DropdownPosition.right}
      className={isKebab ? undefined : 'forklift-dropdown pf-c-menu-toggle'}
      toggle={
        isKebab ? (
          <KebabToggle id="toggle-kebab" onToggle={toggle} />
        ) : (
          <DropdownToggle id="toggle-basic" onToggle={toggle}>
            {t('Actions')}
          </DropdownToggle>
        )
      }
      dropdownItems={PlanActionsDropdownItems({ data })}
    />
  );
};

export const PlanActionsDropdown: React.FC<PlanActionsDropdownProps> = (props) => (
  <ModalHOC>
    <PlanActionsKebabDropdown_ {...props} />
  </ModalHOC>
);

export interface PlanActionsDropdownProps extends CellProps {
  isKebab?: boolean;
}
