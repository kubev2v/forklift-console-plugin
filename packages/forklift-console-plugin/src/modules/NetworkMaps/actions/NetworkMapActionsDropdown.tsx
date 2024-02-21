import React from 'react';
import { useToggle } from 'src/modules/Providers/hooks';
import { ModalHOC } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Dropdown, DropdownPosition, DropdownToggle, KebabToggle } from '@patternfly/react-core';

import { CellProps } from '../views/list/components';

import { NetworkMapActionsDropdownItems } from './NetworkMapActionsDropdownItems';

import './NetworkMapActionsDropdown.style.css';

const NetworkMapActionsKebabDropdown_: React.FC<NetworkMapActionsDropdownProps> = ({
  data,
  isKebab,
}) => {
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
      dropdownItems={NetworkMapActionsDropdownItems({ data })}
    />
  );
};

export const NetworkMapActionsDropdown: React.FC<NetworkMapActionsDropdownProps> = (props) => (
  <ModalHOC>
    <NetworkMapActionsKebabDropdown_ {...props} />
  </ModalHOC>
);

export interface NetworkMapActionsDropdownProps extends CellProps {
  isKebab?: boolean;
}
