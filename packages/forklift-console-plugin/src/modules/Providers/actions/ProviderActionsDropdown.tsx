import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Dropdown, DropdownPosition, DropdownToggle, KebabToggle } from '@patternfly/react-core';

import { useToggle } from '../hooks';
import { ModalHOC } from '../modals';
import { CellProps } from '../views';

import { ProviderActionsDropdownItems } from './ProviderActionsDropdownItems';

import './ProviderActionsDropdown.style.css';

/**
 * ProviderActionsKebabDropdown_ is a helper component that displays a kebab dropdown menu.
 * @param {CellProps} props - The properties passed to this component.
 * @param {ProviderWithInventory} props.data - The data to be used in ProviderActionsDropdownItems.
 * @returns {React.Element} The rendered dropdown menu component.
 */
const ProviderActionsKebabDropdown_: React.FC<ProviderActionsDropdownProps> = ({
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
      dropdownItems={ProviderActionsDropdownItems({ data })}
    />
  );
};

/**
 * ProviderActionsDropdown is a component that provides a context for the dropdown menu.
 * It uses a ModalProvider to manage modals that may be used in the dropdown menu.
 * @param {CellProps} props - The properties passed to this component.
 * @returns {React.Element} The rendered component with a ModalProvider context.
 */
export const ProviderActionsDropdown: React.FC<ProviderActionsDropdownProps> = (props) => (
  <ModalHOC>
    <ProviderActionsKebabDropdown_ {...props} />
  </ModalHOC>
);

export interface ProviderActionsDropdownProps extends CellProps {
  isKebab?: boolean;
}
